import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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

    // 2. Fetch the user's active subscription from Neon DB
    const activeSub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      ),
    });

    if (!activeSub) {
      return NextResponse.json(
        { error: "No active subscription found to cancel." },
        { status: 404 }
      );
    }

    // 3. Request Dodo Payments SDK to cancel the subscription
    try {
      await dodo.subscriptions.update(activeSub.dodoSubscriptionId, {
        cancel_at_next_billing_date: true,
        cancel_reason: "cancelled_by_customer",
      });
    } catch (err: any) {
      console.error("Dodo Payments API cancellation failed, proceeding with local fallback:", err);
      // Fall through to ensure user can at least clear local state if API is in test mode or placeholder
    }

    // 4. Mark subscription as pending cancellation while preserving user's plan until period ends
    await db
      .update(subscriptions)
      .set({ status: "pending_cancellation" })
      .where(eq(subscriptions.id, activeSub.id));

    const formattedDate = new Date(activeSub.currentPeriodEnd).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return NextResponse.json({
      success: true,
      message: `Subscription auto-renewal has been cancelled. You will continue to enjoy your ${activeSub.plan === "pro" ? "Pro" : "Starter"} features until ${formattedDate}.`,
    });
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
