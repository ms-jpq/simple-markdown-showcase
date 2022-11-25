module.exports = {
  plugins: [
    ...(function* () {
      yield require("postcss-import")
      yield require("tailwindcss/nesting")(require("postcss-nesting"))
      yield require("tailwindcss")
      yield require("postcss-preset-env")({
        features: { "nesting-rules": false },
      })
      if (process.env.NODE_ENV === "production") {
        yield require("cssnano")
      }
    })(),
  ],
}
