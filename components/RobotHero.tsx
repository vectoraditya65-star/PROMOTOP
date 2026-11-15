"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { moneyWhole } from "@/lib/format";
import SubmitProjectModal from "./SubmitProjectModal";
import CatMascot3D from "./CatMascot3D";

type AnalyticsData = {
  totalProducts: number;
  totalVolumeCents: number;
  highestBidCents: number;
  productsAddedToday: number;
};

type Category = {
  id?: string;
  slug: string;
  name: string;
};

const DEFAULT_CATEGORIES: Category[] = [
  { slug: "leaderboards", name: "🔥 Leaderboards" },
  { slug: "seo-ai-visibility", name: "🔍 SEO & AI Visibility" },
  { slug: "marketing", name: "📢 Marketing" },
  { slug: "productivity", name: "⚡ Productivity" },
  { slug: "agents", name: "🤖 Agents" },
  { slug: "crypto", name: "🪙 Crypto" },
  { slug: "developer", name: "💻 Developer" },
  { slug: "explore", name: "🧩 Explore" },
];

interface RobotHeroProps {
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export default function RobotHero({
  activeCategory = "all",
  onSelectCategory,
}: RobotHeroProps) {
  const { data: session, status } = useSession();
  const [isDark, setIsDark] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [stats, setStats] = useState<AnalyticsData>({
    totalProducts: 0,
    totalVolumeCents: 0,
    highestBidCents: 0,
    productsAddedToday: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // Sync theme across document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#090d16";
      document.body.style.color = "#f8fafc";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    }
  }, [isDark]);

  // Fetch analytics & categories
  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") setStats(data);
      })
      .catch(() => {});

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.categories;
        if (Array.isArray(list) && list.length > 0) setCategories(list);
      })
      .catch(() => {});
  }, []);

  const handleBidClick = () => {
    if (status !== "authenticated") {
      window.location.href = "/login";
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <section
      className={`w-full py-6 px-6 border-b font-sans transition-colors duration-500 ${
        isDark
          ? "bg-[#0b1120] text-slate-100 border-slate-800"
          : "bg-[#f4f6f3] text-neutral-900 border-neutral-200"
      }`}
    >
      {/* Top Status & Auth Bar */}
      <div
        className={`max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b transition-colors ${
          isDark ? "border-slate-800" : "border-neutral-200/60"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs shadow-sm transition-colors ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-300"
                : "bg-white border-neutral-200 text-neutral-600"
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`font-semibold ${isDark ? "text-white" : "text-neutral-800"}`}>
              System Live
            </span>
            <span className="opacity-40">•</span>
            <span>{stats.productsAddedToday} items today</span>
          </div>

          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-colors shadow-sm ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <span>{soundEnabled ? "🔊 Cat Voice: ON" : "🔇 Cat Voice: OFF"}</span>
          </button>

          <a
            href="mailto:support@promotop.app"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition-colors shadow-sm ${
              isDark
                ? "bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            support@promotop.app
          </a>
        </div>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <div
              className={`flex flex-col sm:flex-row items-start sm:items-center gap-2.5 px-4 py-2 rounded-2xl border shadow-sm ${
                isDark ? "bg-slate-900 border-slate-700" : "bg-white border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${isDark ? "text-slate-300" : "text-neutral-700"}`}>
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>

              <div
                className={`flex items-center gap-2 pt-1 sm:pt-0 sm:border-l sm:pl-2.5 ${
                  isDark ? "sm:border-slate-700" : "sm:border-neutral-200"
                }`}
              >
                <Link
                  href="/dashboard"
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    isDark
                      ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition"
                >
                  + Add Project
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-full transition-colors shadow-sm"
              >
                Sign In
              </a>
              <a
                href="/register"
                className={`px-4 py-2 border font-medium text-xs rounded-full transition-colors shadow-sm ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Register
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-6">
        {/* Left Column: Brand Title + Real Three.js 3D Roaming Cat */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-emerald-500 mb-2 uppercase">
            PROMOTOP
          </h1>

          <CatMascot3D
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Right Column: Leaderboard Info, Metrics & Bid CTA */}
        <div className="lg:col-span-7 space-y-4">
          <div
            className={`border rounded-2xl p-6 shadow-sm transition-colors ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-neutral-200"
            }`}
          >
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-neutral-900"}`}>
              Leaderboard & Rank Bidding
            </h2>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
              Claim top visibility on PROMOTOP. Bid higher than the top listing to instantly take the #1 rank spot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`border p-5 rounded-2xl shadow-sm transition-colors ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
                  Total Listings
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {stats.totalProducts}
              </p>
            </div>

            <div
              className={`border p-5 rounded-2xl shadow-sm transition-colors ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-neutral-200"
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
                Total Volume
              </div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {moneyWhole(stats.totalVolumeCents)}
              </p>
            </div>

            <div
              className={`border p-5 rounded-2xl shadow-sm transition-colors ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-neutral-200"
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${isDark ? "text-slate-400" : "text-neutral-500"}`}>
                Current #1 Bid
              </div>
              <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-neutral-900"}`}>
                {moneyWhole(stats.highestBidCents)}
              </p>
            </div>
          </div>

          <div
            className={`border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-neutral-200"
            }`}
          >
            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                Rank #1 Target
              </span>
              <span className="text-lg font-bold text-emerald-500">
                {moneyWhole(stats.highestBidCents + 100)} or higher
              </span>
            </div>
            <button
              onClick={handleBidClick}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              {status === "authenticated" ? "Bid for #1 Rank Spot" : "Sign In to Bid"}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        className={`max-w-7xl mx-auto pt-4 border-t transition-colors ${
          isDark ? "border-slate-800" : "border-neutral-200"
        }`}
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory?.("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "all"
                ? "bg-emerald-600 text-white"
                : isDark
                ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700"
                : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            🌐 All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory?.(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === cat.slug
                  ? "bg-emerald-600 text-white"
                  : isDark
                  ? "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bid Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div
            className={`rounded-2xl p-6 max-w-md w-full shadow-2xl border ${
              isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">Claim Rank #1</h3>
            <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-neutral-600"}`}>
              Enter your bid amount. Must be higher than current highest bid ({moneyWhole(stats.highestBidCents)}).
            </p>
            <input
              type="number"
              placeholder="Enter bid amount in USD"
              className={`w-full px-4 py-2 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-neutral-300 text-neutral-900"
              }`}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 text-sm ${isDark ? "text-slate-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Bid submitted successfully!");
                  setIsModalOpen(false);
                }}
                className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Project Modal */}
      <SubmitProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onSuccess={() => {
          setIsAddProjectModalOpen(false);
          window.location.reload();
        }}
      />
    </section>
  );
}