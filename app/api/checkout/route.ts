import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { productSubmissionSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { requireUser } from "@/lib/session";

const MIN_INCREMENT_CENTS = 100; // must beat the current top bid by at least $1

export async function POST(req: NextRequest) {
  // 1. Require a real, logged-in account. Anonymous claims aren't
  // accepted — this is what lets a user manage their own listings later
  // (see /dashboard) and lets admins act on a specific account rather than
  // a free-typed email nobody verified.
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  // 2. Rate limit, before touching the DB or Stripe.
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`checkout:${user.id}:${ip}`, 5, 60_000);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // 3. Validate and sanitize everything from the client. Never trust
  // amounts, URLs, or free text sent from the browser.
  const body = await req.json().catch(() => null);
  const parsed = productSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const category = await db.category.findUnique({
    where: { slug: data.categorySlug },
  });
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  // 4. Re-derive the minimum bid server-side. The price shown in the UI is
  // only a suggestion for the browser — the authoritative check happens
  // here so a manipulated client request can't claim a rank for less than
  // it costs.
  const top = await db.product.findFirst({
    where: { categoryId: category.id, active: true },
    orderBy: { currentBidCents: "desc" },
    select: { currentBidCents: true },
  });
  const minimumCents = (top?.currentBidCents ?? 0) + MIN_INCREMENT_CENTS;
  if (data.bidCents < minimumCents) {
    return NextResponse.json(
      { error: `Bid must be at least $${(minimumCents / 100).toFixed(2)}.` },
      { status: 400 }
    );
  }

  // 5. Create the product in a "pending" (inactive) state. It only becomes
  // visible on the public leaderboard once the webhook confirms payment —
  // this is what stops someone from getting a free listing by abandoning
  // checkout.
  const product = await db.product.create({
    data: {
      name: data.name,
      description: data.description,
      url: data.url,
      handle: data.handle,
      categoryId: category.id,
      ownerId: user.id,
      currentBidCents: data.bidCents,
      active: false,
    },
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Claim rank in ${category.name} — ${data.name}`,
          },
          unit_amount: data.bidCents,
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    success_url: `${process.env.APP_URL}/claimed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/`,
    metadata: { productId: product.id, userId: user.id },
  });

  await db.bid.create({
    data: {
      productId: product.id,
      amountCents: data.bidCents,
      stripeSessionId: session.id,
      bidderId: user.id,
      status: "pending",
    },
  });

  return NextResponse.json({ url: session.url });
}
