"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { Sprout } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [legalName, setLegalName] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [pan, setPan] = useState("");
  const [gst, setGst] = useState("");
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getBrowserSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/auth/sign-in");
          return;
        }
        const { data } = await supabase
          .from("users")
          .select("phone, legal_name, street1, street2, city, state, postal_code, pan, gst, bio, social_twitter, social_instagram, social_youtube, social_website")
          .eq("id", user.id)
          .maybeSingle();
        
        if (data) {
          setPhone(data.phone || "");
          setLegalName(data.legal_name || "");
          setStreet1(data.street1 || "");
          setStreet2(data.street2 || "");
          setCity(data.city || "");
          setState(data.state || "");
          setPostalCode(data.postal_code || "");
          setPan(data.pan || "");
          setGst(data.gst || "");
          setBio(data.bio || "");
          setTwitter(data.social_twitter || "");
          setInstagram(data.social_instagram || "");
          setYoutube(data.social_youtube || "");
          setWebsite(data.social_website || "");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("users")
        .update({
          phone,
          legal_name: legalName,
          street1,
          street2,
          city,
          state,
          postal_code: postalCode,
          pan: pan || null,
          gst: gst || null,
          bio: bio || null,
          social_twitter: twitter || null,
          social_instagram: instagram || null,
          social_youtube: youtube || null,
          social_website: website || null,
        })
        .eq("id", user.id);

      if (error) throw error;
      setSaved(true);
      // Redirect to dashboard after brief success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      alert(err?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Your business details for payouts</p>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-500" />
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm">Phone *</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  required
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="legalName" className="text-sm">Legal Name *</label>
                <input
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="street1" className="text-sm">Street Address Line 1 *</label>
                <input
                  id="street1"
                  value={street1}
                  onChange={(e) => setStreet1(e.target.value)}
                  placeholder="123 Main Street"
                  required
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="street2" className="text-sm">Street Address Line 2 *</label>
                <input
                  id="street2"
                  value={street2}
                  onChange={(e) => setStreet2(e.target.value)}
                  placeholder="Near Main Road"
                  required
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm">City *</label>
                  <input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    required
                    className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm">State *</label>
                  <input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    required
                    className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                  />
                  <p className="text-xs text-muted-foreground">Full state name (e.g., Maharashtra, Karnataka, Delhi)</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="postalCode" className="text-sm">PIN Code *</label>
                  <input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="400001"
                    maxLength={6}
                    required
                    className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Public Profile */}
          <div className="space-y-4">
            <h3 className="font-semibold">Public Profile</h3>
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your supporters about yourself and your work..."
                rows={3}
                maxLength={500}
                className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none resize-none"
              />
              <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Social Links (Optional)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="twitter" className="text-sm">Twitter/X</label>
                <input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="instagram" className="text-sm">Instagram</label>
                <input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="youtube" className="text-sm">YouTube</label>
                <input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@username"
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="website" className="text-sm">Website</label>
                <input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Legal (optional) */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal Information (Optional)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="pan" className="text-sm">PAN</label>
                <input
                  id="pan"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gst" className="text-sm">GST (if applicable)</label>
                <input
                  id="gst"
                  value={gst}
                  onChange={(e) => setGst(e.target.value.toUpperCase())}
                  placeholder="18AABCT1234A1Z1"
                  maxLength={15}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-md bg-emerald-500 text-white px-6 py-3 text-sm font-medium hover:bg-emerald-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Details"}
            </button>
            {saved && <span className="text-sm text-emerald-700">✓ Saved</span>}
          </div>

          <p className="text-xs text-muted-foreground">
            These details are required by Razorpay for KYC compliance. They will be securely stored and used only for payment processing.
          </p>
        </form>
      </div>
    </main>
  );
}

