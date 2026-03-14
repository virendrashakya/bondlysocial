/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          bg:      "#0A0A0A",
          surface: "#0F0F0F",
          card:    "rgba(255,255,255,0.04)",
          border:  "#242424",
          hover:   "#1A1A1A",
          input:   "#141414",
        },
        brand: {
          DEFAULT: "#FF3D6B",
          hover:   "#E8355F",
          light:   "#FF6B8A",
          muted:   "rgba(255,61,107,0.12)",
          border:  "rgba(255,61,107,0.3)",
        },
      },
      animation: {
        shimmer:      "shimmer 1.8s infinite",
        drift:        "drift 14s ease-in-out infinite alternate",
        "drift-2":    "drift 18s ease-in-out infinite alternate-reverse",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "page-enter": "pageEnter 0.22s ease-out both",
      },
      keyframes: {
        shimmer: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        drift: {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "100%": { transform: "translate(80px, 50px) scale(1.15)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pageEnter: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
