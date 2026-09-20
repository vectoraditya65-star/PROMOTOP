"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";

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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false));
  }, [status]);

  if (status !== "authenticated") return null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-900 text-paper">Your listings</h1>
        <a href="/" className="text-sm text-slate hover:text-paper">Back to leaderboard</a>
      </div>
      <p className="mb-6 text-sm text-slate">Signed in as {session?.user?.email}</p>

      {loading ? (
        <p className="text-slate">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-slate">You haven't claimed a rank yet.</p>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {products.map((p) => (
            <li key={p.id} className="py-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-paper">{p.name}</span>
                <span className="text-sm text-slate">
                  {p.active ? "Live" : "Pending payment"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate">
                {p.category.name} · current bid {money(p.currentBidCents)}
              </p>
              <ul className="mt-2 space-y-1">
                {p.bids.map((b) => (
                  <li key={b.id} className="text-xs text-slate">
                    {money(b.amountCents)} — {b.status} —{" "}
                    {new Date(b.createdAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
