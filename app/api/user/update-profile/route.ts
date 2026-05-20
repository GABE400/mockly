import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const userId = session.user.id;

    // 2. Parse JSON payload
    const body = await request.json();
    const { avatarUrl, name } = body;

    // 3. Formulate update fields
    const updateData: Record<string, any> = {};
    
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
      updateData.image = avatarUrl; // Sync both columns
    }
    
    if (name !== undefined && name.trim().length > 0) {
      updateData.name = name.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update." },
        { status: 400 }
      );
    }

    // 4. Update the user record in Neon PostgreSQL
    const updatedUsers = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        avatarUrl: user.avatarUrl,
      });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUsers[0],
    });
  } catch (error: any) {
    console.error("Error updating profile settings:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
