"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { money } from "@/lib/format";
import SubmitProjectModal from "@/components/SubmitProjectModal";

type Bid = { id: string; amountCents: number; status: string; createdAt: string };
type Product = {
  id: string;
  name: string;
  currentBidCents: number;
  active: boolean;
  category: { name: string };
  bids: Bid[];
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchUserProducts = () => {
    if (status !== "authenticated") return;
    setLoading(true);
    fetch("/api/me/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch((err) => console.error("Error fetching user products:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUserProducts();
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight text-emerald-600">
            PROMOTOP
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
            >
              Back to leaderboard
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition"
            >
              + Upload Project
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Your listings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Signed in as <span className="font-semibold text-slate-700">{session?.user?.email}</span>
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500 font-medium">
            Loading your projects…
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-bold text-xl text-emerald-600">
              🚀
            </div>
            <h3 className="mb-1 text-lg font-bold text-slate-800">No projects listed yet</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-slate-500">
              You haven&apos;t claimed a rank or listed a project yet. Submit your SaaS or product to take the #1 spot on PROMOTOP!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition"
            >
              Submit a project now
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <ul className="divide-y divide-slate-100">
              {products.map((p) => (
                <li key={p.id} className="p-6 transition hover:bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">{p.name}</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.active ? "Live" : "Pending payment"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">
                      {p.category?.name || "General"}
                    </span>{" "}
                    · Current bid:{" "}
                    <span className="font-bold text-emerald-600">
                      {money(p.currentBidCents)}
                    </span>
                  </p>

                  {p.bids && p.bids.length > 0 && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Bid History
                      </p>
                      <ul className="space-y-1">
                        {p.bids.map((b) => (
                          <li
                            key={b.id}
                            className="flex items-center justify-between text-xs text-slate-600"
                          >
                            <span>{money(b.amountCents)}</span>
                            <span className="capitalize text-slate-500">{b.status}</span>
                            <span className="text-slate-400">
                              {new Date(b.createdAt).toLocaleDateString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Submission Modal */}
        <SubmitProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchUserProducts}
        />
      </main>
    </div>
  );
}