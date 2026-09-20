import { money, moneyWhole } from "@/lib/format";

describe("moneyWhole", () => {
  it("formats whole dollars with thousands separators", () => {
    expect(moneyWhole(1700100)).toBe("$17,001");
  });

  it("rounds to the nearest dollar", () => {
    expect(moneyWhole(149)).toBe("$1");
    expect(moneyWhole(150)).toBe("$2"); // rounds up at the midpoint
  });

  it("handles zero", () => {
    expect(moneyWhole(0)).toBe("$0");
  });
});

describe("money", () => {
  it("formats cents as dollars and cents", () => {
    expect(money(1050)).toBe("$10.5");
  });

  it("formats an exact dollar amount without stray decimals", () => {
    expect(money(500)).toBe("$5");
  });
});
