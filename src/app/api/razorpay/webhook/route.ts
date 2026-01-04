import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing Razorpay webhook secret" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const order = payment.order_id;
      const amount = payment.amount;
      const paymentId = payment.id;

      // Fetch order notes
      const notes = payment.notes || {};
      const username = notes.username || null;
      const charityPercentage = parseInt(notes.charity_percentage || "0", 10);
      const creatorId = notes.creator_id || null;

      if (amount > 0 && creatorId) {
        const supabase = await getServerSupabaseClient();
        await supabase.from("donations").insert({
          creator_id: creatorId,
          amount_cents: amount,
          charity_percentage: charityPercentage,
          stripe_payment_intent_id: paymentId, // reusing this column for razorpay payment_id
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Webhook error" }, { status: 500 });
  }
}

