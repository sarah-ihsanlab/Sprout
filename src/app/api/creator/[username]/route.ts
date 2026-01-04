import { NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = await getServerSupabaseClient();
    
    const { data: creator, error } = await supabase
      .from("users")
      .select("username, display_name, avatar_url, bio, social_twitter, social_instagram, social_youtube, social_website, payment_gateway, stripe_account_id, razorpay_account_id")
      .eq("username", username)
      .maybeSingle();

    if (error || !creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json(creator, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}


