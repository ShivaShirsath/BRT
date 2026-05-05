export function money(value: unknown): string {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "₹0";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
