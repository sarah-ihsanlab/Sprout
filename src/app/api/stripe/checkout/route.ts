import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { amountCents, username, charityPercentage } = await request.json();
    if (!amountCents || amountCents < 50) {
      return NextResponse.json({ error: "amountCents must be >= 50 (minimum $0.50)" }, { status: 400 });
    }
    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const supabase = await getServerSupabaseClient();
    const { data: creator, error: fetchErr } = await supabase
      .from("users")
      .select("id, stripe_account_id")
      .eq("username", username)
      .maybeSingle();
    if (fetchErr || !creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (!creator.stripe_account_id) {
      return NextResponse.json({ error: "Creator hasn't connected Stripe yet" }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // Calculate platform fee (2%)
    const platformFeePercent = 2;
    const applicationFeeAmount = Math.floor(amountCents * platformFeePercent / 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Support ${username}`,
              description: charityPercentage ? `Includes ${charityPercentage}% for charity` : undefined,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: creator.stripe_account_id,
        },
        metadata: {
          username,
          charity_percentage: String(charityPercentage ?? 0),
          creator_id: creator.id,
        },
      },
      success_url: `${origin}/${username}?status=success`,
      cancel_url: `${origin}/${username}?status=cancelled`,
      metadata: {
        username,
        charity_percentage: String(charityPercentage ?? 0),
        creator_id: creator.id,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: e?.message ?? "Checkout error" }, { status: 500 });
  }
}




