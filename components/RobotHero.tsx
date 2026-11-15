"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

type CatState = "sleeping" | "grooming" | "pulling";

export default function RobotHero({
  activeCategory = "all",
  onSelectCategory,
}: RobotHeroProps) {
  const { data: session, status } = useSession();
  const [isDark, setIsDark] = useState(false);
  const [catState, setCatState] = useState<CatState>("sleeping");
  const [isBlinking, setIsBlinking] = useState(false);
  const [isLicking, setIsLicking] = useState(false);
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

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize Minecraft-style retro pitch-glide cat meow & click using Web Audio API
  const playCatMeow = (type: "meow" | "purr" | "click" = "meow") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      if (type === "click") {
        // Pull-chain metallic click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
        return;
      }

      if (type === "meow") {
        // Minecraft-style cute synthesized meow (rising then falling formant pitch)
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.14);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.42);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1100, now);
        filter.Q.setValueAtTime(3.5, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.46);
      } else if (type === "purr") {
        // Soft low purr rumble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(55, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // Ignore autoplay restrictions before first user click
    }
  };

  // Apply dark mode class to document body/html so the whole site responds
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

  // 1-minute sleep -> wake up & 3-minute grooming cycle -> back to sleep
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (catState === "sleeping") {
      // Sleep for 1 minute (60,000 ms), then wake up and groom
      timer = setTimeout(() => {
        setCatState("grooming");
        playCatMeow("meow");
      }, 60000);
    } else if (catState === "grooming") {
      // Groom & stay awake for 3 minutes (180,000 ms), then sleep again
      timer = setTimeout(() => {
        setCatState("sleeping");
      }, 180000);
    }

    return () => clearTimeout(timer);
  }, [catState]);

  // Periodic licking motion while grooming
  useEffect(() => {
    if (catState !== "grooming") {
      setIsLicking(false);
      return;
    }

    const lickInterval = setInterval(() => {
      setIsLicking(true);
      playCatMeow("purr");
      setTimeout(() => setIsLicking(false), 1800);
    }, 4500);

    // Trigger initial lick right after waking
    setIsLicking(true);
    const initialTimeout = setTimeout(() => setIsLicking(false), 1800);

    return () => {
      clearInterval(lickInterval);
      clearTimeout(initialTimeout);
    };
  }, [catState]);

  // Natural blinking when awake
  useEffect(() => {
    if (catState === "sleeping") return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3600);
    return () => clearInterval(interval);
  }, [catState]);

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

  // Handle clicking the cat or pull cord: cat rises, pulls chain, toggles Light/Dark theme
  const handleCatPullSwitch = () => {
    if (catState === "pulling") return;
    const previousState = catState === "sleeping" ? "grooming" : catState;

    setCatState("pulling");
    playCatMeow("meow");

    setTimeout(() => {
      playCatMeow("click");
      setIsDark((prev) => !prev);
    }, 240);

    setTimeout(() => {
      setCatState(previousState);
    }, 750);
  };

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
            title="Toggle Cat Sound"
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
        {/* Left Column: Title + Interactive 3D-Styled Cat + Pull-Cord Switch */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-emerald-500 mb-3 uppercase">
            PROMOTOP
          </h1>

          {/* Interactive Cat & Fan Pull-Chain Container */}
          <div className="relative flex items-center justify-center my-1 select-none">
            {/* Status Pill above Cat */}
            <div
              className={`absolute -top-1 left-2 z-10 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-sm transition-colors ${
                isDark
                  ? "bg-slate-800/90 border-slate-700 text-emerald-400"
                  : "bg-white/90 border-neutral-200 text-neutral-700"
              }`}
            >
              {catState === "sleeping" && "💤 Sleeping (wakes in 1m)"}
              {catState === "grooming" && (isLicking ? "👅 Grooming..." : "🐱 Awake (click to pull switch)")}
              {catState === "pulling" && (isDark ? "☀️ Switching to Light..." : "🌙 Switching to Dark...")}
            </div>

            {/* Clickable 3D-Shaded Black Cat SVG */}
            <motion.div
              onClick={handleCatPullSwitch}
              title="Click the cat to pull the light switch!"
              className="cursor-pointer relative"
              animate={{
                y: catState === "pulling" ? -16 : 0,
                scale: catState === "pulling" ? 1.04 : 1,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
            >
              <svg
                width="260"
                height="270"
                viewBox="0 0 300 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-xl"
              >
                <defs>
                  {/* 3D Fur Gradients */}
                  <radialGradient id="catBody3D" cx="38%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#3a3d46" />
                    <stop offset="55%" stopColor="#18191e" />
                    <stop offset="100%" stopColor="#090a0d" />
                  </radialGradient>
                  <radialGradient id="catHead3D" cx="40%" cy="32%" r="68%">
                    <stop offset="0%" stopColor="#434752" />
                    <stop offset="55%" stopColor="#191b20" />
                    <stop offset="100%" stopColor="#090a0d" />
                  </radialGradient>
                  <linearGradient id="earInner3D" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f3a683" />
                    <stop offset="100%" stopColor="#cf6a48" />
                  </linearGradient>
                  <radialGradient id="eyeGlow" cx="45%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#d4f765" />
                    <stop offset="70%" stopColor="#9ec63b" />
                    <stop offset="100%" stopColor="#6c8e1e" />
                  </radialGradient>
                </defs>

                {/* Floor Shadow */}
                <ellipse
                  cx="135"
                  cy="275"
                  rx={catState === "pulling" ? "62" : "75"}
                  ry="10"
                  fill={isDark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.16)"}
                />

                {/* Curling Tail */}
                <motion.path
                  d="M 172 248 C 235 252, 245 210, 222 180 C 204 156, 224 128, 244 138"
                  stroke="url(#catBody3D)"
                  strokeWidth="15"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d:
                      catState === "sleeping"
                        ? "M 172 254 C 215 262, 225 245, 200 236 C 180 230, 175 248, 192 252"
                        : [
                            "M 172 248 C 235 252, 245 210, 222 180 C 204 156, 224 128, 244 138",
                            "M 172 248 C 242 248, 252 200, 228 172 C 210 150, 232 122, 250 132",
                            "M 172 248 C 235 252, 245 210, 222 180 C 204 156, 224 128, 244 138",
                          ],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Body & Haunches (Squashes slightly when sleeping) */}
                <motion.g
                  animate={{
                    scaleY: catState === "sleeping" ? 0.86 : 1,
                    y: catState === "sleeping" ? 26 : 0,
                  }}
                  style={{ transformOrigin: "135px 265px" }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Back Haunch */}
                  <path
                    d="M 118 145 C 165 145, 192 185, 186 245 C 184 260, 165 265, 140 265 L 105 265 Z"
                    fill="url(#catBody3D)"
                  />
                  {/* Chest & Torso */}
                  <path
                    d="M 96 132 C 88 175, 86 220, 88 262 L 138 262 C 142 215, 140 165, 132 132 Z"
                    fill="url(#catBody3D)"
                  />
                  {/* Subtle 3D Chest Highlight */}
                  <path
                    d="M 104 146 C 100 175, 100 205, 102 230"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />

                  {/* Left Front Leg */}
                  <path
                    d="M 90 175 L 86 258 C 86 266, 103 266, 104 258 L 106 180 Z"
                    fill="url(#catBody3D)"
                  />
                  {/* Left Paw */}
                  <ellipse cx="94" cy="262" rx="11" ry="7" fill="#14151a" />

                  {/* Right Front Leg / Interactive Grooming & Pulling Arm */}
                  <motion.g
                    style={{ transformOrigin: "126px 168px" }}
                    animate={
                      catState === "pulling"
                        ? { rotate: -68, x: 16, y: -12 }
                        : isLicking
                        ? { rotate: -108, x: -6, y: -10 }
                        : { rotate: 0, x: 0, y: 0 }
                    }
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <path
                      d="M 116 168 L 114 258 C 114 267, 132 267, 132 258 L 132 168 Z"
                      fill="url(#catBody3D)"
                    />
                    <ellipse cx="122" cy="263" rx="11" ry="7" fill="#1a1c22" />
                  </motion.g>
                </motion.g>

                {/* Head Group (Tilts when sleeping or grooming) */}
                <motion.g
                  style={{ transformOrigin: "112px 115px" }}
                  animate={{
                    y: catState === "sleeping" ? 42 : 0,
                    rotate:
                      catState === "sleeping"
                        ? 10
                        : isLicking
                        ? [-4, 6, -4]
                        : 0,
                  }}
                  transition={{
                    duration: isLicking ? 0.7 : 0.6,
                    repeat: isLicking ? Infinity : 0,
                  }}
                >
                  {/* Left Ear */}
                  <path d="M 65 76 L 58 24 L 100 54 Z" fill="url(#catHead3D)" />
                  <path d="M 69 70 L 64 35 L 93 55 Z" fill="url(#earInner3D)" />

                  {/* Right Ear */}
                  <path d="M 158 76 L 166 24 L 124 54 Z" fill="url(#catHead3D)" />
                  <path d="M 154 70 L 160 35 L 131 55 Z" fill="url(#earInner3D)" />

                  {/* Main Head Shape with Cheek Tufts */}
                  <path
                    d="M 62 82 C 62 50, 162 50, 162 82 L 171 95 L 158 106 C 148 128, 76 128, 66 106 L 53 95 Z"
                    fill="url(#catHead3D)"
                  />

                  {/* 3D Forehead Sheen */}
                  <ellipse
                    cx="112"
                    cy="64"
                    rx="26"
                    ry="8"
                    fill="rgba(255,255,255,0.07)"
                  />

                  {/* Eyes: Closed Curved Lines when Sleeping/Blinking, Big Lime-Green Eyes when Awake */}
                  {catState === "sleeping" || isBlinking ? (
                    <g stroke="#9ec63b" strokeWidth="3" strokeLinecap="round" fill="none">
                      <path d="M 78 88 Q 89 96 100 88" />
                      <path d="M 124 88 Q 135 96 146 88" />
                    </g>
                  ) : (
                    <g>
                      {/* Left Eye */}
                      <ellipse cx="89" cy="86" rx="14" ry="12" fill="url(#eyeGlow)" />
                      <ellipse cx="90" cy="86" rx="6.5" ry="9" fill="#090a0d" />
                      <circle cx="86" cy="82" r="2.6" fill="#FFFFFF" />

                      {/* Right Eye */}
                      <ellipse cx="135" cy="86" rx="14" ry="12" fill="url(#eyeGlow)" />
                      <ellipse cx="134" cy="86" rx="6.5" ry="9" fill="#090a0d" />
                      <circle cx="130" cy="82" r="2.6" fill="#FFFFFF" />
                    </g>
                  )}

                  {/* Pink Nose */}
                  <path d="M 107 101 L 117 101 L 112 107 Z" fill="#e88d72" />

                  {/* Mouth & Animated Pink Tongue when Licking/Grooming */}
                  <path
                    d="M 103 111 Q 108 115 112 107 Q 116 115 121 111"
                    stroke="#3e414c"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />

                  <AnimatePresence>
                    {isLicking && (
                      <motion.path
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: [0.3, 1.1, 0.3] }}
                        exit={{ scaleY: 0 }}
                        transition={{ duration: 0.65, repeat: Infinity }}
                        style={{ transformOrigin: "112px 111px" }}
                        d="M 108 111 C 108 122, 116 122, 116 111 Z"
                        fill="#fb7185"
                      />
                    )}
                  </AnimatePresence>

                  {/* Whiskers */}
                  <g stroke="#64748b" strokeWidth="1.2" opacity="0.65">
                    <line x1="66" y1="101" x2="42" y2="96" />
                    <line x1="66" y1="106" x2="40" y2="107" />
                    <line x1="158" y1="101" x2="182" y2="96" />
                    <line x1="158" y1="106" x2="184" y2="107" />
                  </g>
                </motion.g>

                {/* Floating Zzz Animation when Sleeping */}
                {catState === "sleeping" && (
                  <g fill="#10b981" fontWeight="bold" fontSize="14">
                    <motion.text
                      x="165"
                      y="95"
                      animate={{ y: [95, 70], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                    >
                      z
                    </motion.text>
                    <motion.text
                      x="180"
                      y="80"
                      fontSize="18"
                      animate={{ y: [80, 50], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.4, delay: 0.8, repeat: Infinity }}
                    >
                      Z
                    </motion.text>
                  </g>
                )}
              </svg>
            </motion.div>

            {/* Ceiling-Fan Style Beaded Pull-Chain Switch */}
            <div
              onClick={handleCatPullSwitch}
              title="Pull cord to toggle Light / Dark theme"
              className="flex flex-col items-center cursor-pointer ml-1 -mt-12 group"
            >
              {/* Top Ceiling Socket */}
              <div
                className={`w-5 h-2.5 rounded-t-md border ${
                  isDark ? "bg-slate-700 border-slate-600" : "bg-neutral-300 border-neutral-400"
                }`}
              />
              {/* Animated Pull Chain & Knob */}
              <motion.div
                animate={{
                  y: catState === "pulling" ? 28 : 0,
                }}
                whileHover={{ y: 6 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="flex flex-col items-center"
              >
                {/* Beaded Chain */}
                <div className="flex flex-col items-center gap-1 py-0.5">
                  {[...Array(9)].map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDark ? "bg-amber-300/80" : "bg-neutral-500"
                      }`}
                    />
                  ))}
                </div>
                {/* Pull Handle Knob */}
                <div
                  className={`px-2 py-1.5 rounded-full border shadow-md flex flex-col items-center justify-center transition-colors ${
                    isDark
                      ? "bg-amber-400 border-amber-300 text-slate-950"
                      : "bg-slate-900 border-slate-700 text-amber-300"
                  }`}
                >
                  <span className="text-xs leading-none">{isDark ? "☀️" : "🌙"}</span>
                </div>
                <span
                  className={`mt-1 text-[10px] font-bold tracking-tight uppercase ${
                    isDark ? "text-slate-400" : "text-neutral-500"
                  }`}
                >
                  Pull
                </span>
              </motion.div>
            </div>
          </div>
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