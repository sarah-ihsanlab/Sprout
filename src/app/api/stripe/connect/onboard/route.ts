import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await getServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-12-18.acacia" });

    // Fetch user profile
    const { data: profile, error: profErr } = await supabase
      .from("users")
      .select("stripe_account_id, email, username, display_name")
      .eq("id", user.id)
      .maybeSingle();
    if (profErr) throw profErr;

    let accountId = profile?.stripe_account_id as string | null;

    // If account already exists, create a new onboarding link
    if (accountId) {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        type: 'account_onboarding',
      });
      return NextResponse.json({ url: accountLink.url }, { status: 200 });
    }

    // Create new Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: profile?.email || undefined,
      metadata: {
        user_id: user.id,
        username: profile?.username || '',
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    accountId = account.id;

    // Save to database
    const { error: updErr } = await supabase
      .from("users")
      .update({ 
        stripe_account_id: accountId,
        payment_gateway: 'stripe'
      })
      .eq("id", user.id);
    if (updErr) throw updErr;

    // Create AccountLink for hosted onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url }, { status: 200 });
  } catch (e: any) {
    console.error("Stripe Connect onboarding error:", e);
    return NextResponse.json({ error: e?.message ?? "Onboarding error" }, { status: 500 });
  }
}




