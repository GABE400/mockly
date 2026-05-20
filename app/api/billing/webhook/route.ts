import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { dodo } from "@/lib/dodo";

export async function POST(request: NextRequest) {
  try {
    // 1. Retrieve the standard cryptographic headers required for Standard Webhooks verification
    const signature = request.headers.get("webhook-signature") || "";
    const timestamp = request.headers.get("webhook-timestamp") || "";
    const webhookId = request.headers.get("webhook-id") || "";

    if (!signature || !timestamp || !webhookId) {
      console.warn("Webhook warning: Missing signature, timestamp, or event-id headers.");
      return NextResponse.json(
        { error: "Missing webhook security headers." },
        { status: 400 }
      );
    }

    // 2. Read the raw text payload body
    const rawBody = await request.text();

    // 3. Cryptographically verify and safely parse the event payload utilizing the official SDK unwrap helper
    let event: any;
    try {
      event = dodo.webhooks.unwrap(rawBody, {
        headers: {
          "webhook-id": webhookId,
          "webhook-signature": signature,
          "webhook-timestamp": timestamp,
        },
        key: process.env.DODO_WEBHOOK_SECRET,
      });
    } catch (err: any) {
      console.error("Cryptographic signature verification failed for Dodo Payments Webhook:", err);
      return NextResponse.json(
        { error: "Invalid cryptographic signature." },
        { status: 401 }
      );
    }

    console.log(`Processing Dodo Payments Webhook: type=${event.type}, subscription_id=${event.data?.subscription_id}`);

    const subscriptionData = event.data;
    if (!subscriptionData) {
      return NextResponse.json({ success: true, message: "Non-subscription event ignored." });
    }

    // 4. Retrieve metadata to identify the registered DB user
    const userId = subscriptionData.metadata?.userId;

    if (!userId) {
      console.error("Webhook error: Missing userId in metadata.");
      return NextResponse.json(
        { error: "Malformed payload metadata. Missing userId." },
        { status: 400 }
      );
    }

    // Check if user exists in the database
    const existingUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!existingUser) {
      console.error(`Webhook error: User with ID ${userId} does not exist in DB.`);
      return NextResponse.json(
        { error: "User associated with checkout session not found." },
        { status: 404 }
      );
    }

    const dodoSubId = subscriptionData.subscription_id;
    const status = subscriptionData.status; // e.g. "active", "cancelled", "failed"
    const nextBillingDate = subscriptionData.next_billing_date
      ? new Date(subscriptionData.next_billing_date)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Fallback to 30 days ahead

    // 5. Handle lifecycle events
    switch (event.type) {
      case "subscription.active":
      case "subscription.renewed":
      case "subscription.created": {
        console.log(`Upgrading user ${userId} to Pro plan.`);
        
        // Transaction to ensure atomic consistency
        await db.transaction(async (tx) => {
          // A. Set user plan to "pro"
          await tx
            .update(user)
            .set({ plan: "pro" })
            .where(eq(user.id, userId));

          // B. Upsert subscription record
          // Try to select existing subscription record by dodoSubscriptionId
          const existingSub = await tx.query.subscriptions.findFirst({
            where: eq(subscriptions.dodoSubscriptionId, dodoSubId),
          });

          if (existingSub) {
            await tx
              .update(subscriptions)
              .set({
                status: status,
                currentPeriodEnd: nextBillingDate,
                plan: "pro",
              })
              .where(eq(subscriptions.dodoSubscriptionId, dodoSubId));
          } else {
            await tx.insert(subscriptions).values({
              id: `sub_${crypto.randomUUID()}`,
              userId: userId,
              dodoSubscriptionId: dodoSubId,
              plan: "pro",
              status: status,
              currentPeriodEnd: nextBillingDate,
            });
          }
        });

        break;
      }

      case "subscription.cancelled":
      case "subscription.expired":
      case "payment.failed": {
        console.log(`Downgrading user ${userId} to Free plan due to event: ${event.type}.`);

        // Transaction to ensure atomic consistency
        await db.transaction(async (tx) => {
          // A. Downgrade user plan back to "free"
          await tx
            .update(user)
            .set({ plan: "free" })
            .where(eq(user.id, userId));

          // B. Update subscription record status
          await tx
            .update(subscriptions)
            .set({
              status: event.type === "payment.failed" ? "failed" : "cancelled",
            })
            .where(eq(subscriptions.dodoSubscriptionId, dodoSubId));
        });

        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Critical webhook handling error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Webhook Handler Error" },
      { status: 500 }
    );
  }
}
