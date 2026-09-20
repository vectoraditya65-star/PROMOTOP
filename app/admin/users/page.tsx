"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  banned: boolean;
  createdAt: string;
};

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    const role = (session?.user as any)?.role;
    if (status === "unauthenticated" || role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if ((session?.user as any)?.role === "ADMIN") load();
  }, [session]);

  async function setBanned(userId: string, banned: boolean) {
    setBusyId(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, banned }),
    });
    await load();
    setBusyId(null);
  }

  if ((session?.user as any)?.role !== "ADMIN") return null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-900 text-paper">Admin · Users</h1>
        <nav className="flex gap-4 text-sm">
          <a href="/admin" className="text-slate hover:text-paper">Listings</a>
          <a href="/" className="text-slate hover:text-paper">Leaderboard</a>
        </nav>
      </div>

      {loading ? (
        <p className="text-slate">Loading…</p>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-paper">{u.email}</p>
                <p className="text-xs text-slate">
                  {u.role} · joined {new Date(u.createdAt).toLocaleDateString()}
                  {u.banned ? " · banned" : ""}
                </p>
              </div>
              {u.role !== "ADMIN" && (
                <button
                  disabled={busyId === u.id}
                  onClick={() => setBanned(u.id, !u.banned)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-paper disabled:opacity-50"
                >
                  {u.banned ? "Unban" : "Ban"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
