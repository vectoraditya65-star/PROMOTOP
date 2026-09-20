"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  active: boolean;
  currentBidCents: number;
  category: { name: string };
  owner: { email: string };
  bids: { id: string; status: string }[];
};

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    const role = (session?.user as any)?.role;
    if (status === "unauthenticated" || role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") load();
  }, [session]);

  async function toggleActive(id: string, active: boolean) {
    setBusyId(id);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, active }),
    });
    await load();
    setBusyId(null);
  }

  async function refund(bidId: string) {
    if (!confirm("Issue a real refund through Stripe for this payment?")) return;
    setBusyId(bidId);
    const res = await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidId }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error ?? "Refund failed.");
    await load();
    setBusyId(null);
  }

  if ((session?.user as any)?.role !== "ADMIN") return null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-900 text-paper">Admin · Listings</h1>
        <nav className="flex gap-4 text-sm">
          <a href="/admin/users" className="text-slate hover:text-paper">Users</a>
          <a href="/" className="text-slate hover:text-paper">Leaderboard</a>
        </nav>
      </div>

      {loading ? (
        <p className="text-slate">Loading…</p>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {products.map((p) => {
            const lastBid = p.bids[0];
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-paper">{p.name}</p>
                  <p className="text-xs text-slate">
                    {p.category.name} · {p.owner.email} · {money(p.currentBidCents)} ·{" "}
                    {p.active ? "live" : "hidden"}
                    {lastBid ? ` · last payment: ${lastBid.status}` : ""}
                  </p>
                </div>
                <button
                  disabled={busyId === p.id}
                  onClick={() => toggleActive(p.id, !p.active)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-paper disabled:opacity-50"
                >
                  {p.active ? "Remove from board" : "Restore"}
                </button>
                {lastBid && lastBid.status === "paid" && (
                  <button
                    disabled={busyId === lastBid.id}
                    onClick={() => refund(lastBid.id)}
                    className="rounded-full bg-ember px-3 py-1 text-xs font-semibold text-ink disabled:opacity-50"
                  >
                    Refund
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
