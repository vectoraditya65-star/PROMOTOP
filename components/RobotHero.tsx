"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { moneyWhole } from "@/lib/format";
import SubmitProjectModal from "./SubmitProjectModal";

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
  const [isBlinking, setIsBlinking] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [stats, setStats] = useState<AnalyticsData>({
    totalProducts: 0,
    totalVolumeCents: 0,
    highestBidCents: 0,
    productsAddedToday: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
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
    <section className="w-full bg-[#f4f6f3] text-neutral-900 py-6 px-6 border-b border-neutral-200 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-200/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs text-neutral-600 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-neutral-800">System Live</span>
            <span className="text-neutral-300">•</span>
            <span>{stats.productsAddedToday} items today</span>
          </div>

          <a
            href="mailto:support@promotop.app"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Help & Support: support@promotop.app
          </a>
        </div>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-neutral-700">
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1 sm:pt-0 sm:border-l sm:border-neutral-200 sm:pl-2.5">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
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
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-full transition-colors shadow-sm"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium text-xs rounded-full transition-colors shadow-sm"
              >
                Register
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-6">
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-emerald-600 mb-6 uppercase">
            PROMOTOP
          </h1>

          <div className="relative flex flex-col items-center my-2">
            <svg
              width="220"
              height="260"
              viewBox="0 0 260 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              <rect x="40" y="20" width="180" height="130" rx="65" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="4"/>
              <rect x="60" y="40" width="140" height="90" rx="45" fill="#0F172A" />

              <motion.ellipse
                cx="95"
                cy="85"
                rx="18"
                ry={isBlinking ? "2" : "18"}
                fill="#38BDF8"
                transition={{ duration: 0.1 }}
              />
              <motion.ellipse
                cx="165"
                cy="85"
                rx="18"
                ry={isBlinking ? "2" : "18"}
                fill="#38BDF8"
                transition={{ duration: 0.1 }}
              />

              <rect x="70" y="155" width="120" height="100" rx="30" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="4"/>
              <circle cx="130" cy="195" r="16" fill="#10B981" />

              <rect x="35" y="165" width="24" height="60" rx="12" fill="#E2E8F0" />

              <motion.g
                style={{ transformOrigin: "205px 175px" }}
                initial={{ rotate: 0 }}
                animate={{
                  rotate: [0, -145, -120, -150, -120, -150, 0],
                }}
                transition={{
                  duration: 3.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <rect x="200" y="165" width="24" height="65" rx="12" fill="#E2E8F0" />
                <circle cx="212" cy="235" r="12" fill="#38BDF8" />
              </motion.g>
            </svg>

            <div className="w-40 h-3 bg-neutral-300/60 rounded-full blur-sm mt-1"></div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Leaderboard & Rank Bidding
            </h2>
            <p className="text-neutral-600 text-sm">
              Claim top visibility on PROMOTOP. Bid higher than the top listing to instantly take the #1 rank spot.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-neutral-500 font-medium">Total Listings</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {stats.totalProducts}
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm">
              <div className="text-xs text-neutral-500 font-medium mb-1">Total Volume</div>
              <p className="text-2xl font-bold text-neutral-900">
                {moneyWhole(stats.totalVolumeCents)}
              </p>
            </div>

            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm">
              <div className="text-xs text-neutral-500 font-medium mb-1">Current #1 Bid</div>
              <p className="text-2xl font-bold text-neutral-900">
                {moneyWhole(stats.highestBidCents)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-xs text-neutral-400 uppercase tracking-wider block">Rank #1 Target</span>
              <span className="text-lg font-bold text-emerald-600">
                {moneyWhole(stats.highestBidCents + 100)} or higher
              </span>
            </div>
            <button
              onClick={handleBidClick}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              {status === "authenticated" ? "Bid for #1 Rank Spot" : "Sign In to Bid"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory?.("all")}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              activeCategory === "all"
                ? "bg-emerald-600 text-white"
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
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Claim Rank #1</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Enter your bid amount. Must be higher than current highest bid ({moneyWhole(stats.highestBidCents)}).
            </p>
            <input
              type="number"
              placeholder="Enter bid amount in USD"
              className="w-full px-4 py-2 border border-neutral-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Bid submitted successfully!");
                  setIsModalOpen(false);
                }}
                className="px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700"
              >
                Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}

      <SubmitProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
      />
    </section>
  );
}