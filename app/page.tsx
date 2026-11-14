"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { moneyWhole } from "@/lib/format";
import RobotHero from "@/components/RobotHero";
import SubmitProjectModal from "@/components/SubmitProjectModal";

type Product = {
  id: string;
  name: string;
  description: string;
  url: string;
  handle?: string | null;
  currentBidCents: number;
  clicks: number;
  category: { name: string; slug: string };
};

type Category = { id: string; slug: string; name: string };

export default function Home() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ticker items for moving headline animation
  const tickerItems = [
    "🚀 PROMOTOP Live: Ranked listings updated in real-time!",
    "🏆 Top Spot Bid: Claim #1 rank spot across categories!",
    "🔥 New claims and bid updates in real time",
    "⚡ Contact Support: support@promotop.app",
  ];

  // Fetch categories from database
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setCategories(d);
        } else {
          setCategories([]);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  // Fetch products based on active category
  const fetchProducts = () => {
    setLoading(true);
    const url =
      activeCategory === "all"
        ? "/api/products"
        : `/api/products?category=${activeCategory}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setProducts(d);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  return (
    <main className="min-h-screen bg-[#fcfbf9] text-neutral-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Animated Hero Header (Handles Category Click Events) */}
      <RobotHero
        activeCategory={activeCategory}
        onSelectCategory={(slug) => setActiveCategory(slug)}
      />

      {/* 2. Moving News Headline Ticker */}
      <div className="w-full bg-emerald-50/60 border-y border-emerald-200/80 py-2.5 overflow-hidden shadow-inner">
        <div className="flex whitespace-nowrap">
          <motion.div
            className="flex items-center gap-12 text-sm font-semibold text-emerald-950"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 25,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation & Secondary Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-neutral-200">
          {/* Scrollable Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                activeCategory === "all"
                  ? "bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              🌐 All
            </button>
            {Array.isArray(categories) &&
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                    activeCategory === cat.slug
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
          </div>

          {/* Top User Status Header */}
          <div className="flex items-center gap-3 shrink-0">
            {status === "authenticated" ? (
              <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 shadow-sm">
                <span className="text-xs font-medium text-neutral-700">
                  {session.user?.email}
                </span>

                <Link
                  href="/dashboard"
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Dashboard
                </Link>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition"
                >
                  + Add Project
                </button>

                <button
                  onClick={() => signOut()}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors pl-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-full transition-colors shadow-sm"
              >
                Sign In
              </a>
            )}
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Most Active Products & Ranks
          </h2>
          <p className="text-sm text-neutral-500">
            Current live ranked listings and highest bidders across selected categories.
          </p>
        </div>

        {/* Product Card Grid */}
        {loading ? (
          <div className="py-20 text-center text-neutral-500 font-medium animate-pulse">
            Loading products...
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="py-20 text-center bg-white border border-neutral-200 rounded-3xl p-8 text-neutral-500">
            No active products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="bg-white border border-neutral-200/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                      {product.category?.name || "Featured"}
                    </span>
                    <span className="text-xs font-black text-neutral-400 group-hover:text-neutral-900 transition-colors">
                      Rank #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-neutral-400 font-medium block">
                      Current Bid
                    </span>
                    <span className="text-lg font-extrabold text-neutral-900">
                      {moneyWhole(product.currentBidCents)}
                    </span>
                  </div>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                  >
                    View Deal
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Submission Modal */}
      <SubmitProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </main>
  );
}