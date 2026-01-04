import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await getServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    // Fetch user record
    const { data: profile, error: profErr } = await supabase
      .from("users")
      .select("stripe_account_id, email")
      .eq("id", user.id)
      .maybeSingle();
    if (profErr) throw profErr;

    let accountId = profile?.stripe_account_id as string | null;
    if (!accountId) {
      const account = await stripe.accounts.create({ type: "express", email: profile?.email || undefined });
      accountId = account.id;
      const { error: updErr } = await supabase
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
      if (updErr) throw updErr;
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard` ,
      return_url: `${origin}/dashboard`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Onboarding error" }, { status: 500 });
  }
}





