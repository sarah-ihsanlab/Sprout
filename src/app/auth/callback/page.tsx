"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const didExchangeRef = useRef(false);

  useEffect(() => {
    const run = async () => {
      const supabase = getBrowserSupabaseClient();
      const url = new URL(window.location.href);
      const hasAuthCode = url.searchParams.get("code") || url.searchParams.get("token_hash");
      
      console.log("Callback URL:", window.location.href);
      console.log("Has auth code:", !!hasAuthCode);

      try {
        // 1) Try to resolve implicit/hash tokens first (Supabase parses window.location.hash)
        const sessionResult = await supabase.auth.getSession();
        if (sessionResult.error) {
          // non-fatal; we'll try PKCE next if applicable
          // console.debug("getSession error", sessionResult.error);
        }
        if (sessionResult.data.session) {
          // session ready; route by profile
          const { data: { user } } = await supabase.auth.getUser();
          const { data } = await supabase.from("users").select("username").eq("id", user!.id).maybeSingle();
          
          // If no user record, create one with OAuth profile data
          if (!data) {
            const displayName = user!.user_metadata?.full_name || user!.user_metadata?.name || null;
            const avatarUrl = user!.user_metadata?.avatar_url || user!.user_metadata?.picture || null;
            await supabase.from("users").upsert({
              id: user!.id,
              email: user!.email,
              display_name: displayName,
              avatar_url: avatarUrl,
            });
          }
          
          router.replace(data?.username ? "/dashboard" : "/onboarding");
          return;
        }

        // 2) If no session yet and we have an auth code, do PKCE exchange once
        if (hasAuthCode && !didExchangeRef.current) {
          didExchangeRef.current = true;
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) throw exchangeError;

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user after exchange");
          const { data } = await supabase.from("users").select("username").eq("id", user.id).maybeSingle();
          
          // If no user record, create one with OAuth profile data
          if (!data) {
            const displayName = user.user_metadata?.full_name || user.user_metadata?.name || null;
            const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
            await supabase.from("users").upsert({
              id: user.id,
              email: user.email,
              display_name: displayName,
              avatar_url: avatarUrl,
            });
          }
          
          router.replace(data?.username ? "/dashboard" : "/onboarding");
          return;
        }

        // 3) If neither produced a session, show an actionable message
        setError("We couldn't complete sign-in. Please open the email link in the same browser you used to request it and try again.");
      } catch (e: any) {
        setError(e?.message ?? "Failed to complete sign-in");
      }
    };

    run();
  }, [router]);

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Finishing sign-in…</h1>
      <p className="text-sm text-muted-foreground">Please wait while we complete your login.</p>
      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </main>
  );
}
