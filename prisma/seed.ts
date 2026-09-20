import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const categories = [
  "Leaderboards",
  "SEO",
  "Marketing",
  "Productivity",
  "Agents",
  "Crypto",
  "Developer",
  "Other",
];

async function main() {
  for (const name of categories) {
    const slug = name.toLowerCase();
    await db.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }
  console.log(`Seeded ${categories.length} categories.`);

  // Optionally bootstrap one admin account from env vars so a fresh
  // database has a way into /admin. This is a one-time convenience for
  // setup — rotate the password after first login.
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { role: "ADMIN" },
      create: { email: email.toLowerCase().trim(), passwordHash, role: "ADMIN" },
    });
    console.log(`Admin account ready for ${email}.`);
  } else {
    console.log("No SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD set — skipping admin bootstrap.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
