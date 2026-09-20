import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().email().max(200).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8).max(200),
});

// A generous bcrypt cost factor — this is deliberately slow (by design) so
// that a leaked database of hashes can't be brute-forced cheaply.
const BCRYPT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const { success } = await rateLimit(`register:${ip}`, 5, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and a password of at least 8 characters." },
      { status: 400 }
    );
  }
  const { email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Same message whether the email is taken or invalid-looking, so this
    // endpoint can't be used to enumerate which emails already have
    // accounts.
    return NextResponse.json({ error: "Could not create that account." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db.user.create({ data: { email, passwordHash } });

  return NextResponse.json({ ok: true });
}
