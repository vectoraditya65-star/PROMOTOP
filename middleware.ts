import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Applies a security header baseline to every response. This is the same
// class of protection outbid.lol-style sites need: it doesn't stop a
// determined attacker on its own, but it closes off entire bug classes
// (reflected XSS execution, clickjacking, MIME sniffing, protocol
// downgrade) essentially for free.
//
// It also gate-keeps /admin and /dashboard at the edge, before any page
// component runs. The pages themselves also check the session client-side
// for a smoother redirect, but that check alone is not real protection —
// this server-side check is what actually stops a signed-out or non-admin
// request from ever rendering the page.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  const res = NextResponse.next();

  // Next.js's dev server (webpack HMR / fast refresh) executes its bundles
  // via eval(), which a strict script-src blocks outright — that's what
  // was making the whole page inert (stuck "Loading…", dead buttons) when
  // running `npm run dev`. Only relax this in development; the production
  // build never needs 'unsafe-eval' and the policy stays strict there.
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com"
    : "script-src 'self' 'unsafe-inline' https://js.stripe.com";
  const connectSrc = isDev
    ? "connect-src 'self' https://api.stripe.com ws://localhost:* http://localhost:*"
    : "connect-src 'self' https://api.stripe.com";

  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      scriptSrc,
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      connectSrc,
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; ")
  );
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return res;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};