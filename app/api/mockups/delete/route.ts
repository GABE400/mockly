import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { mockups } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
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

    const { user } = session;

    // 2. Parse request query or body to get mockup ID
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing mockup ID." },
        { status: 400 }
      );
    }

    // 3. Check ownership and delete mockup from database
    const [existingMockup] = await db
      .select()
      .from(mockups)
      .where(and(eq(mockups.id, id), eq(mockups.userId, user.id)));

    if (!existingMockup) {
      return NextResponse.json(
        { error: "Mockup not found or access denied." },
        { status: 404 }
      );
    }

    await db
      .delete(mockups)
      .where(and(eq(mockups.id, id), eq(mockups.userId, user.id)));

    return NextResponse.json({
      success: true,
      message: "Mockup deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error in delete mockup API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
