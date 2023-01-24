const { screens } = require("tailwindcss/defaultTheme")
const colors = require("tailwindcss/colors")

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  relative: true,
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography"),
  ],
  content: ["./assets/templates/**/*.html"],
  theme: {
    extend: {
      colors: {
        primary: colors.pink,
        secondary: colors.neutral,
        tertiary: colors.fuchsia,
      },
      screens: (() => {
        const re = /\d+/g
        const unit = screens.xl.replace(re, "")
        const [xl] = screens.xl.match(re) ?? []
        const [txl] = screens["2xl"].match(re) ?? []
        const [lo, hi] = [xl, txl].map(Number)
        const increment = hi - lo

        const addnum = Object.fromEntries(
          [3, 4, 5, 6, 7, 8].map((n, i) => [
            `${n}xl`,
            `${lo + (i + 1) * increment}${unit}`,
          ]),
        )
        return addnum
      })(),
    },
  },
}
