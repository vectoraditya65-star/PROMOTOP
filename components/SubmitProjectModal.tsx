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
              <rect x="40