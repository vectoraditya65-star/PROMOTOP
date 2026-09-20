import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { z } from "zod";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      owner: { select: { email: true } },
      bids: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  return NextResponse.json({ products });
}

const toggleSchema = z.object({ productId: z.string().min(1), active: z.boolean() });

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Removing a listing here just hides it from the public leaderboard
  // (active=false) — the row and its paid Bid history are kept intact for
  // the audit trail and any refund decision.
  const product = await db.product.update({
    where: { id: parsed.data.productId },
    data: { active: parsed.data.active },
  });
  return NextResponse.json({ product: { id: product.id, active: product.active } });
}
