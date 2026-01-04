import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { amountCents, username, charityPercentage } = await request.json();
    if (!amountCents || amountCents < 50) {
      return NextResponse.json({ error: "amountCents must be >= 50" }, { status: 400 });
    }
    if (!username) {
      return NextResponse.json({ error: "username is required" }, { status: 400 });
    }

    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpayKey || !razorpaySecret) {
      return NextResponse.json({ error: "Missing Razorpay credentials" }, { status: 500 });
    }

    const supabase = await getServerSupabaseClient();
    const { data: creator, error: fetchErr } = await supabase
      .from("users")
      .select("id, razorpay_account_id")
      .eq("username", username)
      .maybeSingle();
    if (fetchErr || !creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKey,
      key_secret: razorpaySecret,
    });

    const orderData: any = {
      amount: amountCents,
      currency: "INR",
      receipt: `${username}_${Date.now()}`,
      notes: {
        username,
        charity_percentage: String(charityPercentage ?? 0),
        creator_id: creator.id,
      },
    };

    // Add transfers if creator has linked account (with 2% platform fee)
    if (creator.razorpay_account_id) {
      const platformFeePercent = 2;
      const creatorAmount = Math.floor(amountCents * (100 - platformFeePercent) / 100); // 98% to creator
      
      orderData.transfers = [
        {
          account: creator.razorpay_account_id,
          amount: creatorAmount,
          currency: "INR",
          notes: {
            username,
            charity_percentage: String(charityPercentage ?? 0),
            platform_fee_percent: String(platformFeePercent),
          },
        },
      ];
    }

    const order = await razorpay.orders.create(orderData);

    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Checkout error" }, { status: 500 });
  }
}
