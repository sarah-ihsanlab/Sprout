"use client";

import Link from "next/link";
import { Sprout, Link2, Heart, BarChart3 } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

export default function Home() {
  const { user, isLoading } = useUser();
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Global animated background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/30 blur-3xl animate-blob" />
        <div className="absolute top-32 -right-24 w-96 h-96 bg-rose-200/25 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-[60vh] left-[10vw] w-80 h-80 bg-teal-200/30 blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute bottom-24 right-[15vw] w-72 h-72 bg-emerald-300/25 blur-3xl animate-blob" />
      </div>

      <header className="w-full relative z-10">
        <nav className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-500" />
            <span>Sprout</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</Link>
            {!isLoading && (
              user ? (
                <Link href="/dashboard" className="inline-flex items-center rounded-full bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-600">Dashboard</Link>
              ) : (
                <Link href="/auth/sign-in" className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50">Sign in</Link>
              )
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="relative">

          <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl leading-tight font-semibold max-w-3xl">
              Support creators. Grow impact.
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl">
              The simplest way for creators to receive donations while making a difference. Every
              contribution can include an optional charity split.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/auth/sign-in" className="inline-flex items-center justify-center rounded-full bg-emerald-500 text-white px-6 py-3 text-sm font-medium hover:bg-emerald-600">Get Started Free</Link>
              <Link href="/demo" className="inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium hover:bg-gray-50">See a demo</Link>
            </div>

            {/* Illustration: Heart + Sprout with caption */}
            <div className="mt-20 flex justify-center w-full">
              <div className="relative w-full max-w-2xl h-52 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm bg-white/40 border border-white/60">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-100/80 flex items-center justify-center animate-float">
                    <Heart className="w-10 h-10 text-emerald-600" />
                  </div>
                  <span className="text-2xl text-emerald-700 select-none">+</span>
                  <div className="w-20 h-20 rounded-full bg-emerald-100/80 flex items-center justify-center animate-float animation-delay-2000">
                    <Sprout className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-700 font-medium">Grow together</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-8 rounded-2xl backdrop-blur-sm bg-white/60 border border-white/80 hover:bg-white/80 hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <Link2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="mb-3 font-semibold">One link for donations</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Share a single link with your audience. Simple, clean, and effective.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-2xl backdrop-blur-sm bg-white/60 border border-white/80 hover:bg-white/80 hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="mb-3 font-semibold">Optional charity split</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Donors can choose to add a percentage that goes directly to charity.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-2xl backdrop-blur-sm bg-white/60 border border-white/80 hover:bg-white/80 hover:shadow-md transition-all">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="mb-3 font-semibold">Transparent dashboard</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Track your donations and see your impact in real-time.
                </p>
              </div>
            </div>
        </div>
        </section>
      </main>

      <footer className="relative z-10 mt-12">
        <div className="mx-auto max-w-6xl px-6 py-12 flex items-center justify-center gap-8 text-sm text-gray-500">
          <button className="hover:text-gray-800 transition-colors">About</button>
          <button className="hover:text-gray-800 transition-colors">Contact</button>
          <button className="hover:text-gray-800 transition-colors">Privacy</button>
        </div>
      </footer>
    </div>
  );
}
