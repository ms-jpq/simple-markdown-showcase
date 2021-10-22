module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-mixins"),
    require("tailwindcss/nesting")(require("postcss-nesting")),
    require("tailwindcss"),
    require("autoprefixer"),
  ],
}
