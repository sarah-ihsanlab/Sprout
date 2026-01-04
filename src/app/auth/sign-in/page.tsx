"use client";

import { useState } from "react";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      alert(err?.message ?? "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      if (error) throw error;
    } catch (err: any) {
      alert(err?.message ?? "Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Sprout className="w-16 h-16 text-emerald-500 mb-4" />
          <h2>Welcome to Sprout <span aria-hidden>🌱</span></h2>
          <p className="text-muted-foreground mt-2">Sign in to your creator account</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {!sent ? (
            <div className="space-y-6">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={googleLoading}
                className="w-full rounded-md border border-border bg-white hover:bg-gray-50 py-3 font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? "Signing in…" : "Continue with Google"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or use email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-border bg-input-background px-3 py-3 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 font-medium"
                >
                  {loading ? "Sending…" : "Send Magic Link"} <span aria-hidden>✉️</span>
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Verified creators, genuine content <span aria-hidden>✨</span>
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl" role="img" aria-label="seedling">🌱</span>
              </div>
              <h3 className="mb-2">Check your email</h3>
              <p className="text-muted-foreground">We sent a magic link to {email}</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? Magic links work for sign up too!
        </p>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
