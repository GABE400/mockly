import { NextRequest, NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { dodo } from "@/lib/dodo";

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

    // 2. Fetch the user's active subscription (if any) to cancel in Dodo Payments
    const activeSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ),
    });

    if (activeSub) {
      try {
        console.log(`Cancelling Dodo subscription ${activeSub.dodoSubscriptionId} due to account deletion...`);
        // Cancel subscription in Dodo Payments immediately
        await dodo.subscriptions.update(activeSub.dodoSubscriptionId, {
          cancel_at_next_billing_date: false, // Cancel immediately since the account is deleted
          cancel_reason: "cancelled_by_customer",
        });
      } catch (err: any) {
        console.error("Dodo Payments subscription cancel failed, proceeding with DB deletion:", err);
      }
    }

    // 3. Delete the user record from PostgreSQL
    // Since Sessions, Accounts, Mockups, and Subscriptions have onDelete: "cascade" configured in db/schema.ts,
    // deleting the user record will automatically cascade delete all associated data in other tables!
    await db.delete(user).where(eq(user.id, userId));

    // 4. Clear all Better Auth session cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.includes("better-auth")) {
        cookieStore.delete(cookie.name as any);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account and all associated mockups have been permanently deleted. Session has been closed.",
    });
  } catch (error: any) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
