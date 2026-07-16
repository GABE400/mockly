import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

// Parser to fetch fileKey and node-ids (can support multiple frames selected at once)
function parseFigmaUrl(url: string) {
  try {
    const urlObj = new URL(url);
    
    // Figma paths: /design/:key/:title or /file/:key/:title
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2 || (pathParts[0] !== "design" && pathParts[0] !== "file")) {
      return null;
    }
    
    const fileKey = pathParts[1];
    
    // Node IDs are usually in multiple query parameters (or comma-separated inside one parameter)
    const rawNodeIds = urlObj.searchParams.getAll("node-id");
    if (!rawNodeIds || rawNodeIds.length === 0) {
      return null;
    }
    
    // Split by commas and trim to support format: ?node-id=10-24,10-25
    const nodeIds = rawNodeIds.flatMap((id) => id.split(",").map((x) => x.trim())).filter(Boolean);
    
    // Figma API expects ":" instead of "-" for node ids (replace all dashes globally)
    const resolvedNodeIds = nodeIds.map((id) => id.replace(/-/g, ":"));
    
    return { fileKey, nodeIds: resolvedNodeIds };
  } catch (e) {
    return null;
  }
}

class RateLimitError extends Error {
  waitTimeMs: number;
  constructor(message: string, waitTimeMs: number) {
    super(message);
    this.name = "RateLimitError";
    this.waitTimeMs = waitTimeMs;
  }
}

// Parses the Retry-After header safely handling seconds, milliseconds, HTTP-dates, and Unix timestamps.
function parseRetryAfter(headerValue: string | null): number | null {
  if (!headerValue) return null;
  
  // 1. Try parsing as a standard HTTP-date string (e.g. "Thu, 16 Jul 2026 12:49:49 GMT")
  const parsedDate = Date.parse(headerValue);
  if (!isNaN(parsedDate)) {
    const diff = parsedDate - Date.now();
    return diff > 0 ? diff : 0;
  }

  // 2. Parse as a numeric string
  const parsedNum = parseFloat(headerValue);
  if (isNaN(parsedNum)) return null;

  // If it's a Unix epoch timestamp in seconds (e.g. 1784208588)
  if (parsedNum > 1000000000) {
    const diffMs = (parsedNum * 1000) - Date.now();
    return diffMs > 0 ? diffMs : 0;
  }

  // If the number is large (e.g., > 3600), it's highly likely it is already in milliseconds
  // (Figma rate limits rarely keep you blocked for more than 1 hour).
  if (parsedNum > 3600) {
    return parsedNum;
  }

  // Otherwise, treat as seconds and convert to milliseconds
  return parsedNum * 1000;
}

interface CustomRequestInit extends RequestInit {
  isSharedToken?: boolean;
}

// Helper function to handle rate-limiting (429) and network/server flakiness (5xx) with retries
async function fetchWithRetry(url: string, options: CustomRequestInit, retries = 4, delay = 1000): Promise<Response> {
  const { isSharedToken, ...fetchOptions } = options;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, fetchOptions);
    
    if (res.status === 429) {
      const retryAfterHeader = res.headers.get("retry-after");
      const waitTime = parseRetryAfter(retryAfterHeader) || (delay * Math.pow(2, i));

      // If we need to wait more than 10 seconds, abort retry to avoid serverless function timeouts
      if (waitTime > 10000) {
        const secondsToWait = Math.ceil(waitTime / 1000);
        const minutesToWait = (secondsToWait / 60).toFixed(1);
        
        let msg = `Figma API rate limit exceeded. Please wait ${secondsToWait} seconds (${minutesToWait} minutes) before syncing again.`;
        if (isSharedToken) {
          msg = `Shared Figma API rate limit exceeded. To bypass this, please add your own Figma Personal Access Token (PAT) in Settings > Account. Otherwise, you must wait ${secondsToWait} seconds (${minutesToWait} minutes).`;
        }
        
        throw new RateLimitError(msg, waitTime);
      }

      console.warn(`[Figma Sync] Rate limited (429). Retrying attempt ${i + 1}/${retries} after ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }
    
    if (res.status >= 500 && res.status < 600) {
      const waitTime = delay * Math.pow(2, i);
      console.warn(`[Figma Sync] Server error (${res.status}). Retrying attempt ${i + 1}/${retries} after ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      continue;
    }
    
    return res;
  }
  return fetch(url, fetchOptions); // Final fallback attempt
}

// Helper to inspect node structure and unpack children of sections, groups, and large layout canvases.
// ANY node that contains 2+ child FRAME/COMPONENT/INSTANCE nodes is treated as a container and unpacked.
async function resolveNodeIds(fileKey: string, nodeIds: string[], token: string, isSharedToken: boolean): Promise<string[]> {
  try {
    // Use the Figma /nodes endpoint to fetch specific node trees with children
    const figmaFileUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeIds.join(",")}`;
    console.log("[Figma Sync] Fetching file structure:", figmaFileUrl);
    const res = await fetchWithRetry(figmaFileUrl, {
      headers: { "X-Figma-Token": token },
      isSharedToken,
    });
    if (!res.ok) {
      console.warn("[Figma Sync] File structure fetch failed, using original node IDs");
      return nodeIds;
    }

    const data = await res.json();
    const resolvedIds: string[] = [];

    for (const nodeId of nodeIds) {
      const nodeData = data.nodes?.[nodeId]?.document;
      if (!nodeData) {
        console.log(`[Figma Sync] Node ${nodeId}: not found in response, keeping as-is`);
        resolvedIds.push(nodeId);
        continue;
      }

      const { type, children } = nodeData;
      console.log(`[Figma Sync] Node ${nodeId}: type=${type}, name="${nodeData.name}", children=${children?.length ?? 0}`);

      // Types that are always containers
      const isContainer = type === "SECTION" || type === "GROUP" || type === "CANVAS" || type === "PAGE";

      // For FRAME type: unpack if it has 2+ renderable child frames
      // (a single-screen frame with decorative child layers should NOT be unpacked)
      const renderableChildren = (children || []).filter(
        (child: any) => child.type === "FRAME" || child.type === "COMPONENT" || child.type === "INSTANCE"
      );

      const shouldUnpack = (isContainer && renderableChildren.length > 0) ||
                           (type === "FRAME" && renderableChildren.length >= 2);

      if (shouldUnpack) {
        console.log(`[Figma Sync] Unpacking container "${nodeData.name}" → ${renderableChildren.length} child screens`);
        renderableChildren.forEach((child: any) => resolvedIds.push(child.id));
      } else {
        resolvedIds.push(nodeId);
      }
    }

    console.log(`[Figma Sync] Resolved ${nodeIds.length} input node(s) → ${resolvedIds.length} screen node(s):`, resolvedIds);
    return resolvedIds;
  } catch (e) {
    console.error("[Figma Sync] Error resolving node IDs:", e);
    return nodeIds;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse payload
    const body = await request.json();
    const { figmaUrl } = body;

    if (!figmaUrl) {
      return NextResponse.json(
        { error: "Figma URL is required." },
        { status: 400 }
      );
    }

    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) {
      return NextResponse.json(
        { 
          error: "Invalid Figma URL format. Please select your frame(s) in Figma, right-click, select 'Copy link to selection', and paste it here." 
        },
        { status: 400 }
      );
    }

    const { fileKey, nodeIds } = parsed;

    // 3. Resolve Figma Token (User PAT or global fallback)
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    const hasUserToken = !!dbUser?.figmaToken;
    const token = dbUser?.figmaToken || process.env.FIGMA_PAT;
    const isSharedToken = !hasUserToken;

    if (!token) {
      return NextResponse.json(
        { error: "Figma integration is not configured. Please add your Figma Personal Access Token in your Account settings." },
        { status: 400 }
      );
    }

    // 3.5 Resolve container nodes (sections, groups, canvas frames) to child screen nodes
    const resolvedIds = await resolveNodeIds(fileKey, nodeIds, token, isSharedToken);

    // 4. Request Figma server-side render for all resolved nodes (PNG at @2x scale)
    console.log(`[Figma Sync] Requesting images for ${resolvedIds.length} node(s):`, resolvedIds);
    const figmaApiUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${resolvedIds.join(",")}&format=png&scale=2`;
    const figmaRes = await fetchWithRetry(figmaApiUrl, {
      headers: {
        "X-Figma-Token": token,
      },
      isSharedToken,
    });

    const figmaData = await figmaRes.json();

    if (!figmaRes.ok) {
      console.error("[Figma Sync] Image API error:", figmaData);
      return NextResponse.json(
        { error: figmaData.err || "Failed to fetch images from Figma. Ensure your file is public or your token has access." },
        { status: figmaRes.status }
      );
    }

    const imageEntries = figmaData.images ? Object.entries(figmaData.images) : [];
    console.log(`[Figma Sync] Figma returned ${imageEntries.length} image(s):`, Object.keys(figmaData.images || {}));

    if (imageEntries.length === 0) {
      return NextResponse.json(
        { error: "Figma did not return any image frames. Please verify you selected valid frames." },
        { status: 404 }
      );
    }

    const screenshots: Array<{ nodeId: string; url: string; fileId: string }> = [];

    // 5. Download image binaries and upload to ImageKit
    for (const [nodeId, imageUrl] of Object.entries(figmaData.images)) {
      if (!imageUrl) continue;

      try {
        const imgResponse = await fetchWithRetry(imageUrl as string, {});
        if (!imgResponse.ok) continue;

        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64File = buffer.toString("base64");

        // Upload to ImageKit
        const uploadRes = await imagekit.upload({
          file: base64File,
          fileName: `figma-${fileKey}-${nodeId.replace(/:/g, "-")}-${Date.now()}.png`,
          folder: `/mockly/screenshots/${session.user.id}`,
        });

        screenshots.push({
          nodeId,
          url: uploadRes.url,
          fileId: uploadRes.fileId,
        });
      } catch (uploadError) {
        console.error(`Failed to process frame ${nodeId}:`, uploadError);
      }
    }

    if (screenshots.length === 0) {
      return NextResponse.json(
        { error: "Failed to download and process any selected frames from Figma." },
        { status: 502 }
      );
    }

    // Return the array of successfully synced screenshot items
    return NextResponse.json({
      screenshots,
    });

  } catch (error: any) {
    console.error("Error in figma sync route:", error);
    if (error.name === "RateLimitError") {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
