"use client";

import { useState } from "react";
import { Sprout, Heart, Shield } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  const [amount, setAmount] = useState("");
  const [addCharity, setAddCharity] = useState(false);

  const donationAmount = parseFloat(amount) || 0;
  const charityAmount = addCharity ? donationAmount * 0.1 : 0;
  const totalAmount = donationAmount + charityAmount;

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    alert("This is a demo! Sign up to create your own donation page.");
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1>Support DemoCreator</h1>
            <Sprout className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-muted-foreground">This is an example of what your donation page will look like</p>
        </div>

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
                    ₹{donationAmount.toFixed(2)} to DemoCreator + ₹{charityAmount.toFixed(2)} to charity
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-md bg-emerald-500 hover:bg-emerald-600 text-white h-14 font-medium"
            >
              Donate (Demo)
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Secure payments powered by Razorpay</span>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
          <p className="text-sm text-muted-foreground mt-3">
            <Link href="/auth/sign-in" className="text-emerald-600 hover:underline">Sign up free</Link> to create your own page
          </p>
        </div>
      </div>
    </main>
  );
}





