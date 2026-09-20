"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

// All categories from images 2 through 5
const CATEGORIES = [
  { id: "all", name: "All", icon: "🌐" },
  { id: "ai-agents", name: "AI Agents & Infrastructure", icon: "🤖" },
  { id: "seo", name: "SEO & AI Visibility", icon: "🎯" },
  { id: "marketing", name: "Marketing & Advertising", icon: "📢" },
  { id: "analytics", name: "Analytics", icon: "📊" },
  { id: "crypto", name: "Crypto, Web3 & Investing", icon: "₿" },
  { id: "dev-tools", name: "Developer Tools", icon: "💻" },
  { id: "business", name: "Business, Finance & Legal", icon: "⚖️" },
  { id: "security", name: "Security, Privacy & Compliance", icon: "🛡️" },
  { id: "health", name: "Health, Fitness & Wellness", icon: "❤️" },
  { id: "social", name: "Social Media & Creator Tools", icon: "📢" },
  { id: "leaderboards", name: "Leaderboards & Attention", icon: "🏆" },
  { id: "jobs", name: "Hiring, Jobs & Careers", icon: "💼" },
  { id: "education", name: "Education & Learning", icon: "🎓" },
  { id: "agencies", name: "Agencies, Studios & Services", icon: "🤝" },
  { id: "ecommerce", name: "Ecommerce & Retail", icon: "🛒" },
  { id: "domains", name: "Domains & Web Assets", icon: "🌐" },
  { id: "games", name: "Games & Entertainment", icon: "🎮" },
  { id: "profiles", name: "People & Profiles", icon: "👤" },
  { id: "productivity", name: "Productivity & Personal Tools", icon: "📋" },
  { id: "design", name: "Design & Creative", icon: "🎨" },
  { id: "writing", name: "Writing & Content", icon: "✏️" },
  { id: "directories", name: "Directories, Launch & Discovery", icon: "🧭" },
  { id: "ai-media", name: "AI Media Generation", icon: "✨" },
  { id: "audio", name: "Audio, Voice & Podcasting", icon: "🎙️" },
  { id: "sales", name: "Sales & Lead Generation", icon: "🎯" },
  { id: "travel", name: "Travel, Local & Lifestyle", icon: "📍" },
  { id: "real-estate", name: "Real Estate & Property", icon: "🏠" },
  { id: "media", name: "Media & News", icon: "📰" },
  { id: "other", name: "Other", icon: "➕" },
];

// Sample ranked listings per category matching the photos
const CATEGORY_DATA: Record<
  string,
  Array<{ rank: number; title: string; price: string; iconBg: string }>
> = {
  "ai-agents": [
    { rank: 1, title: "see.io · see your id...", price: "$17,001", iconBg: "bg-slate-900 text-white" },
    { rank: 2, title: "JONI | Your Person...", price: "$14,028", iconBg: "bg-emerald-600 text-white" },
    { rank: 3, title: "Pecan AI - Predictiv...", price: "$3,750", iconBg: "bg-green-600 text-white" },
  ],
  seo: [
    { rank: 1, title: "Outrank - Grow Or...", price: "$13,005", iconBg: "bg-purple-600 text-white" },
    { rank: 2, title: "CrowdReply - Citati...", price: "$12,711", iconBg: "bg-blue-600 text-white" },
    { rank: 3, title: "ZeroRank | Track & ...", price: "$4,004", iconBg: "bg-black text-white" },
  ],
  marketing: [
    { rank: 1, title: "Tutti — Your all-in-...", price: "$16,000", iconBg: "bg-teal-700 text-white" },
    { rank: 2, title: "Letter Friend | Hand...", price: "$1,303", iconBg: "bg-blue-500 text-white" },
    { rank: 3, title: "Affiliateo | Affiliate ...", price: "$1,302", iconBg: "bg-stone-900 text-white" },
  ],
  analytics: [
    { rank: 1, title: "Website analytics for...", price: "$100", iconBg: "bg-sky-600 text-white" },
    { rank: 2, title: "GitHub - getnao/nao: ...", price: "$61", iconBg: "bg-neutral-800 text-white" },
    { rank: 3, title: "AI Website Builder: AI ...", price: "$15", iconBg: "bg-purple-800 text-white" },
  ],
  crypto: [
    { rank: 1, title: "Orynth - List your p...", price: "$12,716", iconBg: "bg-amber-500 text-white" },
    { rank: 2, title: "PumpFunCoin on X", price: "$3,136", iconBg: "bg-black text-white" },
    { rank: 3, title: "Fiber — The Stablec...", price: "$2,500", iconBg: "bg-cyan-600 text-white" },
  ],
  "dev-tools": [
    { rank: 1, title: "Modulate | Frontier ...", price: "$3,560", iconBg: "bg-rose-600 text-white" },
    { rank: 2, title: "Context.dev: Web S...", price: "$3,555", iconBg: "bg-blue-600 text-white" },
    { rank: 3, title: "The Git platform wh...", price: "$1,337", iconBg: "bg-neutral-900 text-white" },
  ],
  games: [
    { rank: 1, title: "Colonist: Play Settlers...", price: "$414", iconBg: "bg-amber-600 text-white" },
    { rank: 2, title: "TorrentClaw — Torre...", price: "$409", iconBg: "bg-indigo-900 text-white" },
    { rank: 3, title: "Best Crypto & Bitcoi...", price: "$404", iconBg: "bg-red-600 text-white" },
  ],
  "ai-media": [
    { rank: 1, title: "VisualLift — AI Media ...", price: "$400", iconBg: "bg-black text-white" },
    { rank: 2, title: "Product Visuals Gen...", price: "$200", iconBg: "bg-neutral-800 text-white" },
    { rank: 3, title: "Klodsy - Outfit Maker ...", price: "$77", iconBg: "bg-blue-600 text-white" },
  ],
};

// Default items for any category that doesn't have custom mock items
const DEFAULT_ITEMS = [
  { rank: 1, title: "Featured Rank #1 Listing", price: "$1,500", iconBg: "bg-emerald-600 text-white" },
  { rank: 2, title: "Promoted Product #2 Spot", price: "$850", iconBg: "bg-sky-600 text-white" },
  { rank: 3, title: "Growing Platform #3 Spot", price: "$420", iconBg: "bg-indigo-600 text-white" },
];

export default function CategoryGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories =
    activeCategory === "all"
      ? CATEGORIES.filter((c) => c.id !== "all")
      : CATEGORIES.filter((c) => c.id === activeCategory);

  const tickerItems = [
    "🚀 PROMOTOP Live: Ranked listings updated in real-time!",
    "🏆 Top Spot Bid: $17,001 on AI Agents & Infrastructure",
    "🔥 14 New Claims added in the last 24 hours",
    "⚡ Claim your #1 spot now to boost organic reach!",
    "📩 Contact support directly at vectoraditya65@gmail.com",
  ];

  return (
    <section className="w-full bg-[#fcfbf9] py-8 border-b border-neutral-200">
      {/* 1. MOVING NEWS HEADLINE TICKER */}
      <div className="w-full bg-orange-50 border-y border-orange-200/80 py-2.5 overflow-hidden mb-8 shadow-inner">
        <div className="flex whitespace-nowrap">
          <motion.div
            className="flex items-center gap-12 text-sm font-semibold text-orange-950"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 25,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            Most active categories
          </h2>
          <p className="text-sm text-neutral-500">
            Where ranks are getting claimed right now — and who is holding the top spot.
          </p>
        </div>

        {/* 2. CLICKABLE CATEGORY PILLS BAR (Photo 1 Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-neutral-200/60">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isActive
                    ? "bg-orange-600 text-white shadow-orange-200"
                    : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* 3. CATEGORY CARDS GRID (Photos 2-5 Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const items = CATEGORY_DATA[cat.id] || DEFAULT_ITEMS;

            return (
              <div
                key={cat.id}
                className="bg-white border border-neutral-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="font-bold text-neutral-900 text-base">
                    {cat.name}
                  </h3>
                </div>

                {/* Top 3 Rankings Box */}
                <div className="bg-neutral-50 rounded-2xl p-3 space-y-2.5 border border-neutral-100">
                  {items.map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-xl hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[75%]">
                        <span className="font-bold text-neutral-400">
                          #{item.rank}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${item.iconBg}`}
                        >
                          {item.title.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-medium text-neutral-800 truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="font-bold text-orange-600 shrink-0">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}