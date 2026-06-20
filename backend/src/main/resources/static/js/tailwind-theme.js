window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f4f7fb",
          100: "#e7eef8",
          200: "#c8d7ea",
          700: "#10243f",
          800: "#0b1a30",
          900: "#07111f",
          950: "#030914"
        },
        gold: {
          100: "#fff1bc",
          300: "#f6d96b",
          400: "#d7a927",
          500: "#b98512"
        },
        cyan: {
          100: "#d9fbff",
          300: "#6ee7f4",
          400: "#22c8df",
          500: "#0891b2"
        },
        purple: {
          300: "#c4b5fd",
          400: "#9b7cff",
          500: "#7c3aed"
        },
        muted: {
          100: "#eef2f7",
          300: "#c7d2df",
          500: "#6b7788",
          700: "#344054"
        },
        border: {
          light: "#d8e0ea",
          dark: "rgba(255,255,255,0.13)"
        }
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        premium: "0 24px 70px rgba(7, 17, 31, 0.14)",
        glow: "0 0 45px rgba(34, 200, 223, 0.18)",
        gold: "0 18px 48px rgba(215, 169, 39, 0.22)"
      },
      backgroundImage: {
        "soft-grid": "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        "light-grid": "linear-gradient(rgba(16,36,63,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,36,63,0.06) 1px, transparent 1px)"
      }
    }
  }
};
