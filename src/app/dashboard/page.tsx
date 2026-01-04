"use client";

import { Sprout, DollarSign, Link as LinkIcon, Copy as CopyIcon, Check as CheckIcon, LogOut, Heart } from "lucide-react";
import Link from "next/link";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/useUser";
import { useDonations } from "@/lib/hooks/useDonations";
import { format } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { donations, totalAmount, charityAmount, isLoading: donationsLoading } = useDonations(user?.id);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const isPaymentConnected = !!(user?.stripe_account_id || user?.razorpay_account_id);

  // Redirect if not authenticated or no user record
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/sign-in");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </main>
    );
  }

  const hasDonations = donations.length > 0;

  const donationUrl = user?.username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${user.username}` : null;

  const copyLink = async () => {
    if (!donationUrl) return;
    await navigator.clipboard.writeText(donationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const connectStripe = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      // Redirect to Stripe hosted onboarding
      window.location.href = data.url;
    } catch (err: any) {
      alert(err?.message ?? "Unable to connect Stripe");
      setConnecting(false);
    }
  };

  const signOut = async () => {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Creator</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your impact overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/settings" className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
            Settings
          </Link>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Donation link card */}
      <div className="p-4 border rounded-xl bg-card mb-8">
        {user?.username ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">Your donation link</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/${user.username}`} className="font-medium text-emerald-700 hover:underline">
                {donationUrl}
              </Link>
              <button onClick={copyLink} className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                {copied ? <CheckIcon className="w-4 h-4 text-emerald-600" /> : <CopyIcon className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-muted-foreground">You haven't claimed your link yet.</p>
            <Link href="/onboarding" className="inline-flex items-center rounded-md bg-emerald-500 text-white px-3 py-2 text-sm font-medium hover:bg-emerald-600">Claim your link</Link>
          </div>
        )}
      </div>

      {/* Payment Gateway Connect card */}
      {user?.username && (
        <div className="p-4 border rounded-xl bg-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-medium">Receive Payouts</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isPaymentConnected
                  ? `✓ ${user.stripe_account_id ? 'Stripe' : 'Razorpay'} connected - donations go directly to your account`
                  : "Connect Stripe to receive donations from supporters worldwide"}
              </p>
            </div>
            {!isPaymentConnected && (
              <button
                onClick={connectStripe}
                disabled={connecting}
                className="inline-flex items-center rounded-md bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600 disabled:opacity-60"
              >
                {connecting ? "Connecting…" : "Connect Stripe"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Only show stats if payment gateway connected */}
      {isPaymentConnected ? (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 border rounded-xl bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">Total Donations</p>
                  <h2 className="text-4xl font-semibold">
                    {donationsLoading ? "..." : `₹${totalAmount.toFixed(2)}`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="p-6 border rounded-xl bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground mb-2">Charity Given</p>
                  <h2 className="text-4xl font-semibold">
                    {donationsLoading ? "..." : `₹${charityAmount.toFixed(2)}`}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="p-6 border-b">
              <h3 className="font-semibold">Recent Donations</h3>
            </div>
            {donationsLoading ? (
              <div className="p-12 text-center">
                <p className="text-sm text-muted-foreground">Loading donations…</p>
              </div>
            ) : hasDonations ? (
              <div>
                {donations.map((d) => {
                  const amount = d.amount_cents / 100;
                  const charity = Math.floor(d.amount_cents * d.charity_percentage / 100) / 100;
                  return (
                    <div key={d.id} className="p-6 flex items-center justify-between border-t first:border-t-0">
                      <div>
                        <p className="font-medium">Anonymous Donor</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(d.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-600 font-medium">₹{amount.toFixed(2)}</p>
                        {charity > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">+₹{charity.toFixed(2)} to charity</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Heart className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No donations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Share your link to start receiving support!</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="border rounded-xl bg-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="font-semibold mb-2">Ready to receive donations?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Complete your profile in Settings and connect Razorpay to start receiving payments from your supporters.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/settings" className="inline-flex items-center rounded-md bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600">
              Go to Settings
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
