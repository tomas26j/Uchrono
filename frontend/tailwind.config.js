/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      colors: {
        background:  "hsl(var(--surface-base))",
        foreground:  "hsl(var(--ink-primary))",
        card: {
          DEFAULT:    "hsl(var(--surface-raised))",
          foreground: "hsl(var(--ink-primary))"
        },
        popover: {
          DEFAULT:    "hsl(var(--surface-raised))",
          foreground: "hsl(var(--ink-primary))"
        },
        primary: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-ink))"
        },
        secondary: {
          DEFAULT:    "hsl(var(--surface-sunken))",
          foreground: "hsl(var(--ink-primary))"
        },
        muted: {
          DEFAULT:    "hsl(var(--surface-sunken))",
          foreground: "hsl(var(--ink-secondary))"
        },
        destructive: {
          DEFAULT:    "hsl(var(--loss))",
          foreground: "hsl(var(--accent-ink))"
        },
        border: "hsl(var(--border-subtle))",
        input:  "hsl(var(--border-interactive))",
        ring:   "hsl(var(--accent))",
        gain:   "hsl(var(--gain))",
        loss:   "hsl(var(--loss))",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
