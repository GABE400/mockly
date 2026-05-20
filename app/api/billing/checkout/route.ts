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

    // 2. Fetch Dodo Payments Product ID from environment variables
    const productId = process.env.DODO_PRO_PRODUCT_ID;

    if (!productId || productId === "p_placeholder") {
      console.error("Missing DODO_PRO_PRODUCT_ID environment variable.");
      return NextResponse.json(
        { error: "Billing setup is incomplete. Please configure your Pro Product ID in .env" },
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
