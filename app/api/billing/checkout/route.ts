import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { dodo } from "@/lib/dodo";

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

    const { user } = session;

    // 2. Resolve the dynamic Dodo Payments Product ID from body parameters
    let plan = "pro";
    let billingPeriod = "monthly";

    try {
      const body = await request.json();
      if (body) {
        if (body.plan) plan = body.plan;
        if (body.billingPeriod) billingPeriod = body.billingPeriod;
      }
    } catch (e) {
      // Body might be empty or invalid JSON, ignore and fallback to defaults
    }

    let productId: string | undefined;

    if (plan === "starter") {
      productId = billingPeriod === "annual" 
        ? process.env.DODO_STARTER_ANNUAL_PRODUCT_ID 
        : process.env.DODO_STARTER_MONTHLY_PRODUCT_ID;
    } else {
      productId = billingPeriod === "annual" 
        ? process.env.DODO_PRO_ANNUAL_PRODUCT_ID 
        : process.env.DODO_PRO_MONTHLY_PRODUCT_ID || process.env.DODO_PRO_PRODUCT_ID; // fallback to legacy
    }

    if (!productId || productId === "p_placeholder" || productId === "") {
      console.error(`Missing Dodo Payments Product ID for plan=${plan}, billingPeriod=${billingPeriod}`);
      return NextResponse.json(
        { error: `Billing setup is incomplete for plan: ${plan} (${billingPeriod}). Please configure your Product IDs in .env` },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 3. Create checkout session using Dodo Payments SDK
    const checkoutSession = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      customer: {
        email: user.email,
        name: user.name,
      },
      metadata: {
        userId: user.id,
      },
      return_url: `${appUrl}/dashboard`,
      cancel_url: `${appUrl}/dashboard`,
    });

    // 4. Return checkout session URL to trigger redirection in the client
    return NextResponse.json({
      checkoutUrl: checkoutSession.checkout_url,
    });
  } catch (error: any) {
    console.error("Error creating Dodo Payments checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
