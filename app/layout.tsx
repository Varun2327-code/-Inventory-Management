import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "StockPilot — Inventory, in control",
  description: "A thoughtful inventory workspace for growing teams."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
