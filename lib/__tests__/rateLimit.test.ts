import { rateLimit, clientIp } from "@/lib/rateLimit";

describe("rateLimit (in-memory fallback)", () => {
  // No UPSTASH_* env vars are set in the test environment, so rateLimit()
  // exercises the in-memory fallback path.

  it("allows requests up to the max within the window", async () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      const result = await rateLimit(key, 3, 60_000);
      expect(result.success).toBe(true);
    }
  });

  it("blocks requests once the max is exceeded", async () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      await rateLimit(key, 3, 60_000);
    }
    const fourth = await rateLimit(key, 3, 60_000);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("tracks separate keys independently", async () => {
    const keyA = `test:a:${Math.random()}`;
    const keyB = `test:b:${Math.random()}`;
    await rateLimit(keyA, 1, 60_000);
    const blockedA = await rateLimit(keyA, 1, 60_000);
    const allowedB = await rateLimit(keyB, 1, 60_000);
    expect(blockedA.success).toBe(false);
    expect(allowedB.success).toBe(true);
  });

  it("resets after the window elapses", async () => {
    const key = `test:${Math.random()}`;
    await rateLimit(key, 1, 50); // 50ms window
    const blocked = await rateLimit(key, 1, 50);
    expect(blocked.success).toBe(false);
    await new Promise((r) => setTimeout(r, 60));
    const afterWindow = await rateLimit(key, 1, 50);
    expect(afterWindow.success).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers x-forwarded-for, taking the first address", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIp(headers)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' when neither header is present", () => {
    const headers = new Headers();
    expect(clientIp(headers)).toBe("unknown");
  });
});
