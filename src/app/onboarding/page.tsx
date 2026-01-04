"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in");
        return;
      }
      // if user already has username, go to dashboard
      const { data } = await supabase.from("users").select("username").eq("id", user.id).maybeSingle();
      if (data?.username) {
        router.replace("/dashboard");
      }
    };
    check();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const clean = username.trim().toLowerCase();
      if (!/^[a-z0-9_\-]{3,20}$/.test(clean)) {
        throw new Error("Use 3-20 chars: letters, numbers, hyphen or underscore");
      }

      // ensure unique
      const { data: existing } = await supabase.from("users").select("id").eq("username", clean).maybeSingle();
      if (existing) throw new Error("That username is taken");

      // upsert user row with username
      const { error: upsertErr } = await supabase
        .from("users")
        .upsert({ id: user.id, email: user.email, username: clean })
        .eq("id", user.id);
      if (upsertErr) throw upsertErr;

      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Claim your Sprout link</h1>
        <p className="text-sm text-muted-foreground mb-6">Pick a username to get your link: sprout.me/username</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sarah"
              className="w-full rounded-md border border-border bg-input-background px-3 py-3 outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white py-3 font-medium"
          >
            {loading ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </div>
    </main>
  );
}









