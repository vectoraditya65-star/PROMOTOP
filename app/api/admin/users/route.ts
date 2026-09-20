import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { z } from "zod";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, banned: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

const banSchema = z.object({ userId: z.string().min(1), banned: z.boolean() });

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = banSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Admins can't ban themselves out of the console by accident.
  if (parsed.data.userId === admin.id) {
    return NextResponse.json({ error: "You can't ban your own account." }, { status: 400 });
  }

  const user = await db.user.update({
    where: { id: parsed.data.userId },
    data: { banned: parsed.data.banned },
  });
  return NextResponse.json({ user: { id: user.id, banned: user.banned } });
}
