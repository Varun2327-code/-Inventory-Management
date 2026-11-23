export function money(amount: number, currency: string = "$"): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${currency}0.00`;
  return `${currency}${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateSKU(category: string, name: string): string {
  const catPrefix = (category.slice(0, 2) || "IT").toUpperCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${catPrefix}-${randomNum}`;
}

export function formatDateNow(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function formatDateTimeNow(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
