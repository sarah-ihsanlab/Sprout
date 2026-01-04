import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await getServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKey || !razorpaySecret) {
      return NextResponse.json({ error: "Missing Razorpay credentials" }, { status: 500 });
    }

    // Fetch user record with business details
    const { data: profile, error: profErr } = await supabase
      .from("users")
      .select("razorpay_account_id, email, username, phone, legal_name, street1, street2, city, state, postal_code, pan, gst")
      .eq("id", user.id)
      .maybeSingle();
    if (profErr) throw profErr;

    let accountId = profile?.razorpay_account_id as string | null;
    
    // If account already exists, return it
    if (accountId) {
      return NextResponse.json({ 
        accountId,
        message: "Razorpay account already connected."
      }, { status: 200 });
    }

    // Validate required fields before creating account
    if (!profile?.phone || !profile?.legal_name || !profile?.street1 || !profile?.street2 || !profile?.city || !profile?.state || !profile?.postal_code) {
      return NextResponse.json({ 
        error: "Please complete your profile in Settings before connecting Razorpay" 
      }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    });

    // Use username as reference (unique and more readable)
    const shortRef = profile.username!.substring(0, 20);
    
    const accountData: any = {
      email: profile.email || "creator@example.com",
      phone: profile.phone,
      type: "route",
      reference_id: shortRef,
      legal_business_name: profile.legal_name,
      business_type: "individual",
      contact_name: profile.legal_name,
      profile: {
        category: "healthcare",
        subcategory: "clinic",
        addresses: {
          registered: {
            street1: profile.street1,
            street2: profile.street2,
            city: profile.city,
            state: profile.state, // Full state name (e.g., Maharashtra, Karnataka)
            country: "IN",
            postal_code: parseInt(profile.postal_code)
          }
        }
      }
    };

    // Add legal info only if provided
    if (profile.pan || profile.gst) {
      accountData.legal_info = {};
      if (profile.pan) accountData.legal_info.pan = profile.pan;
      if (profile.gst) accountData.legal_info.gst = profile.gst;
    }

    const account = await razorpay.accounts.create(accountData);

    accountId = account.id;
    
    const { error: updErr } = await supabase
      .from("users")
      .update({ razorpay_account_id: accountId })
      .eq("id", user.id);
    if (updErr) throw updErr;

    return NextResponse.json({ 
      accountId,
      message: "Account created. Creator needs to complete KYC via Razorpay dashboard."
    }, { status: 200 });
  } catch (e: any) {
    console.error("Razorpay Route onboarding error:", e);
    return NextResponse.json({ error: e?.message ?? "Onboarding error" }, { status: 500 });
  }
}

