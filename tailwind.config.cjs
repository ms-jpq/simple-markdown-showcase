const colors = require("tailwindcss/colors")

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  relative: true,
  plugins: [require("@tailwindcss/typography")],
  content: ["./assets/templates/**/*.html"],
  theme: {
    extend: {
      colors: {
        primary: colors.pink,
        secondary: colors.neutral,
        tertiary: colors.fuchsia,
      },
      screens: {
        "3xl": "1792px",
        "4xl": "2048px",
      },
    },
  },
}
