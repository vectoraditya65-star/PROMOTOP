import { productSubmissionSchema, clean } from "@/lib/validation";

describe("clean", () => {
  it("strips HTML tags from free text", () => {
    expect(clean("<script>alert(1)</script>Hello")).toBe("alert(1)Hello");
    expect(clean("<b>bold</b> text")).toBe("bold text");
  });

  it("trims surrounding whitespace", () => {
    expect(clean("  hello  ")).toBe("hello");
  });
});

describe("productSubmissionSchema", () => {
  const valid = {
    name: "Pixel Forge",
    description: "Turn a prompt into a full brand kit in minutes.",
    url: "https://pixelforge.example.com",
    categorySlug: "agents",
    bidCents: 5000,
  };

  it("accepts a valid submission", () => {
    const result = productSubmissionSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a name that is too short", () => {
    const result = productSubmissionSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects a description that is too short", () => {
    const result = productSubmissionSchema.safeParse({ ...valid, description: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid URL", () => {
    const result = productSubmissionSchema.safeParse({ ...valid, url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects a bid below the $5 minimum", () => {
    const result = productSubmissionSchema.safeParse({ ...valid, bidCents: 100 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer bid", () => {
    const result = productSubmissionSchema.safeParse({ ...valid, bidCents: 500.5 });
    expect(result.success).toBe(false);
  });

  it("sanitizes HTML out of the name and description on success", () => {
    const result = productSubmissionSchema.safeParse({
      ...valid,
      name: "<b>Pixel</b> Forge",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Pixel Forge");
    }
  });
});
