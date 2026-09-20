import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const products = await db.product.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } }, bids: { orderBy: { createdAt: "desc" } } },
  });

  return NextResponse.json({ products });
}
