import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        muted: "#64748b",
        line: "#edf0f8",
        canvas: "#f7f9fe",
        brand: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          violet: "#7c3aed",
          deep: "#4338ca",
          light: "#eef2ff",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(99,102,241,0.06)",
        card: "0 14px 35px -8px rgba(99,102,241,0.08)",
        purple: "0 20px 45px -8px rgba(99,102,241,0.42)",
      },
    },
  },
  plugins: [],
};
export default config;
