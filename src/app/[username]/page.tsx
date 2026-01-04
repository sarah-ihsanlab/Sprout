"use client";

import { use, useState, useEffect } from "react";
import { Sprout, Heart, Shield } from "lucide-react";

interface UsernamePageProps {
  params: Promise<{ username: string }>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CreatorProfile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_youtube: string | null;
  social_website: string | null;
  payment_gateway: string | null;
  stripe_account_id: string | null;
  razorpay_account_id: string | null;
}

export default function UsernamePage({ params }: UsernamePageProps) {
  const { username } = use(params);
  const [amount, setAmount] = useState("");
  const [addCharity, setAddCharity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donated, setDonated] = useState(false);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);

  const donationAmount = parseFloat(amount) || 0;
  const charityAmount = addCharity ? donationAmount * 0.1 : 0;
  const totalAmount = donationAmount + charityAmount;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    // Fetch creator profile
    fetch(`/api/creator/${username}`)
      .then(r => r.json())
      .then(data => setCreator(data))
      .catch(() => setCreator({ 
        username, 
        display_name: null, 
        avatar_url: null, 
        bio: null, 
        social_twitter: null, 
        social_instagram: null, 
        social_youtube: null, 
        social_website: null,
        payment_gateway: null,
        stripe_account_id: null,
        razorpay_account_id: null
      }));
    
    return () => {
      document.body.removeChild(script);
    };
  }, [username]);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationAmount || donationAmount < 1) return;
    
    // Check if creator has payment setup
    if (!creator?.stripe_account_id && !creator?.razorpay_account_id) {
      alert("This creator hasn't set up payments yet.");
      return;
    }

    setLoading(true);
    try {
      const isStripe = creator.payment_gateway === 'stripe' || creator.stripe_account_id;
      const endpoint = isStripe ? "/api/stripe/checkout" : "/api/checkout";

      if (isStripe) {
        // Stripe Checkout (redirects to Stripe hosted page)
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents: Math.round(totalAmount * 100),
            username,
            charityPercentage: addCharity ? 10 : 0,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Checkout failed");
        window.location.href = data.url;
      } else {
        // Razorpay modal
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountCents: Math.round(totalAmount * 100),
            username,
            charityPercentage: addCharity ? 10 : 0,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Checkout failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: "Sprout",
          description: `Support ${username}`,
          handler: function (response: any) {
            setDonated(true);
            setTimeout(() => {
              setDonated(false);
              setAmount("");
              setAddCharity(false);
            }, 3000);
          },
          prefill: {
            name: "",
            email: "",
          },
          theme: {
            color: "#10b981",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err: any) {
      alert(err?.message ?? "Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-4 mb-4">
            {creator?.avatar_url ? (
              <img 
                src={creator.avatar_url} 
                alt={creator.display_name || username}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <Sprout className="w-10 h-10 text-emerald-500" />
              </div>
            )}
            <div>
              <h1>Support {creator?.display_name || username}</h1>
              {creator?.display_name && (
                <p className="text-sm text-muted-foreground mt-1">@{username}</p>
              )}
            </div>
          </div>
          {creator?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto">{creator.bio}</p>
          )}
          
          {/* Social Links */}
          {(creator?.social_twitter || creator?.social_instagram || creator?.social_youtube || creator?.social_website) && (
            <div className="flex items-center justify-center gap-3 mt-4">
              {creator.social_twitter && (
                <a href={creator.social_twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {creator.social_instagram && (
                <a href={creator.social_instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {creator.social_youtube && (
                <a href={creator.social_youtube} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
              {creator.social_website && (
                <a href={creator.social_website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        {donated ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-emerald-500 animate-pulse" />
            </div>
            <h2 className="mb-3">Thank you!</h2>
            <p className="text-muted-foreground mb-2">
              Your donation of ₹{totalAmount.toFixed(2)} has been received.
            </p>
            {addCharity && (
              <p className="text-sm text-emerald-600">Including ₹{charityAmount.toFixed(2)} to charity 🌱</p>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <form onSubmit={handleDonate} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="amount">Donation Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-input-background pl-8 h-14 px-3 outline-none"
                  />
                </div>
              </div>

              <div className="bg-accent/30 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="mb-1">Add 10% to charity</p>
                      <p className="text-sm text-muted-foreground">
                        {addCharity && donationAmount > 0
                          ? `+₹${charityAmount.toFixed(2)} will go to charity`
                          : "Help make a bigger impact"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddCharity((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addCharity ? "bg-emerald-500" : "bg-switch-background"}`}
                    aria-pressed={addCharity}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${addCharity ? "translate-x-5" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>

              {donationAmount > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-900">Total</span>
                    <span className="text-emerald-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  {addCharity && (
                    <p className="text-sm text-emerald-700 mt-2">
                      ₹{donationAmount.toFixed(2)} to {username} + ₹{charityAmount.toFixed(2)} to charity
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white h-14 font-medium"
              >
                {loading ? "Opening payment…" : "Donate"}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure payments powered by {creator?.stripe_account_id ? 'Stripe' : 'Razorpay'}</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
