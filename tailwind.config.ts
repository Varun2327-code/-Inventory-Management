import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#17211d", muted: "#718078", line: "#e8ede9", canvas: "#f6f8f6", brand: "#1e6b50" }, boxShadow: { soft: "0 8px 30px rgba(21,43,32,.05)" } } },
  plugins: []
};
export default config;
