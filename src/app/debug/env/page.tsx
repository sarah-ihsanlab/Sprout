"use client";

export default function EnvDebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Env Debug</h1>
      <ul className="space-y-2 text-sm">
        <li>
          <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
          {supabaseUrl ? <span className="text-green-700">FOUND</span> : <span className="text-red-700">MISSING</span>}
        </li>
        <li>
          <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
          {supabaseAnon ? <span className="text-green-700">FOUND</span> : <span className="text-red-700">MISSING</span>}
        </li>
      </ul>
      <p className="mt-6 text-xs text-muted-foreground">Values are not printed for security; only presence is shown.</p>
    </main>
  );
}

