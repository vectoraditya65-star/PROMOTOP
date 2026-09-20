import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

// This endpoint is the most security-sensitive part of the app: it's what
// actually grants a paid rank. Two rules make it safe:
//   1. Every request's signature is verified against the raw body using
//      the webhook signing secret — this is the only way to be sure the
//      request really came from Stripe and wasn't forged by a client
//      hitting this URL directly with a fake "paid" event.
//   2. Processing is idempotent (checked by stripeSessionId + current
//      status), since Stripe retries webhooks and can deliver the same
//      event more than once.
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    // Signature didn't match — reject rather than trust the payload.
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bid = await db.bid.findUnique({
      where: { stripeSessionId: session.id },
    });
    if (!bid) {
      // Unknown session — don't 500 (Stripe would keep retrying forever);
      // just acknowledge and move on.
      return NextResponse.json({ received: true });
    }
    if (bid.status === "paid") {
      // Already processed this exact event once before — idempotent no-op.
      return NextResponse.json({ received: true });
    }

    await db.$transaction([
      db.bid.update({
        where: { id: bid.id },
        data: {
          status: "paid",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
        },
      }),
      db.product.update({
        where: { id: bid.productId },
        data: { active: true },
      }),
    ]);
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const bid = await db.bid.findUnique({ where: { stripeSessionId: session.id } });
    if (bid && bid.status === "pending") {
      await db.$transaction([
        db.bid.update({ where: { id: bid.id }, data: { status: "failed" } }),
        db.product.update({ where: { id: bid.productId }, data: { active: false } }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}

// Stripe needs the raw, unparsed body to verify the signature — disable
// Next's default body parsing for this route.
export const runtime = "nodejs";
