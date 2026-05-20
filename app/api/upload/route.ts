import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user session securely on the server
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Parse file payload
    const body = await request.json();
    const { file, fileName } = body;

    if (!file) {
      return NextResponse.json(
        { error: "Missing required 'file' parameter (base64 string)." },
        { status: 400 }
      );
    }

    // 3. Upload file to ImageKit using secure server instance
    const uploadRes = await imagekit.upload({
      file: file, // Accept raw base64 string or buffer
      fileName: fileName || `screenshot-${session.user.id}-${Date.now()}.png`,
      folder: `/mockly/screenshots/${session.user.id}`,
    });

    // 4. Return secure public CDN url
    return NextResponse.json({
      url: uploadRes.url,
      fileId: uploadRes.fileId,
    });
  } catch (error: any) {
    console.error("Error in secure /api/upload route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
