import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: "Missing Stripe secrets" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session.payment_intent) return NextResponse.json({ ok: true });

      const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
      const amount = session.amount_total ?? 0;
      const username = (session.metadata?.username as string) ?? null;
      const charityPercentage = parseInt((session.metadata?.charityPercentage as string) ?? "0", 10) || 0;
      const creatorId = (session.metadata?.creator_id as string) ?? null;

      const supabase = await getServerSupabaseClient();

      if (amount > 0 && creatorId) {
        await supabase.from("donations").insert({
          creator_id: creatorId,
          amount_cents: amount,
          charity_percentage: charityPercentage,
          stripe_payment_intent_id: paymentIntentId,
        });

        // enqueue manual payout if creator has a UPI id
        const { data: creator } = await supabase
          .from("users")
          .select("upi_id")
          .eq("id", creatorId)
          .maybeSingle();

        if (creator?.upi_id) {
          await supabase.from("payout_queue").insert({
            creator_id: creatorId,
            donation_amount_cents: amount,
            upi_id: creator.upi_id,
            status: "pending",
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Webhook error" }, { status: 500 });
  }
}
