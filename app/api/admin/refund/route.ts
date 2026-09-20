import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { requireAdmin } from "@/lib/session";

const schema = z.object({ bidId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const bid = await db.bid.findUnique({ where: { id: parsed.data.bidId } });
  if (!bid) return NextResponse.json({ error: "Bid not found." }, { status: 404 });
  if (bid.status !== "paid") {
    return NextResponse.json({ error: "Only paid bids can be refunded." }, { status: 400 });
  }
  if (!bid.stripePaymentIntentId) {
    return NextResponse.json(
      { error: "No payment record found for this bid." },
      { status: 400 }
    );
  }

  // The refund is issued through Stripe's API against the real payment
  // intent — this actually returns the customer's money, it doesn't just
  // change a database flag.
  await stripe.refunds.create({ payment_intent: bid.stripePaymentIntentId });

  await db.$transaction([
    db.bid.update({ where: { id: bid.id }, data: { status: "refunded" } }),
    db.product.update({ where: { id: bid.productId }, data: { active: false } }),
  ]);

  return NextResponse.json({ ok: true });
}
