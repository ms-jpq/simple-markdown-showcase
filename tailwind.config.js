const colors = require("tailwindcss/colors")

module.exports = {
  content: ["./assets/templates/**/*.html"],
  plugins: [require("@tailwindcss/typography")],
  theme: {
    extend: {
      colors: {
        primary: colors.pink,
        secondary: colors.neutral,
      },
      screens: {
        "3xl": "1792px",
        "4xl": "2048px",
      },
    },
  },
}
