import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Read-only leaderboard endpoint. No auth needed (public data), but still
// bounded — cap page size so nobody can force a huge unbounded query.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("category");
  const take = Math.min(Number(searchParams.get("take") ?? 50), 100);

  const products = await db.product.findMany({
    where: {
      active: true,
      ...(categorySlug && categorySlug !== "all"
        ? { category: { slug: categorySlug } }
        : {}),
    },
    orderBy: { currentBidCents: "desc" },
    take,
    select: {
      id: true,
      name: true,
      description: true,
      url: true,
      handle: true,
      imageUrl: true,
      currentBidCents: true,
      clicks: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
    },
  });

  return NextResponse.json({ products });
}
