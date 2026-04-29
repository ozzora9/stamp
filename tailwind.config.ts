import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["GMarketSans", ...defaultTheme.fontFamily.sans],
        anemone: ["Cafe24AnemoneAir"],
      },
    },
  },
  plugins: [],
} satisfies Config;
