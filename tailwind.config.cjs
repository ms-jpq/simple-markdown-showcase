const colors = require("tailwindcss/colors")

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ["./assets/templates/**/*.html"],
  plugins: [require("@tailwindcss/typography")],
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
