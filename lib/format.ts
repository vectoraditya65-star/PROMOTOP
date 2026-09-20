/** Formats integer cents as a whole-dollar display string, e.g. 174900 -> "$1,749". */
export function moneyWhole(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString()}`;
}

/** Formats integer cents as a dollars-and-cents display string, e.g. 1050 -> "$10.50". */
export function money(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
