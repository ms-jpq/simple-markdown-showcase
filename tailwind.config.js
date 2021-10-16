module.exports = {
  mode: "jit",
  darkMode: "media",
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography")
  ],
  purge: ["assets/**/*.{scss,html,md}"],
}
