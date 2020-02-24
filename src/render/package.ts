import webpack, { Configuration, Stats } from "webpack"
import { resolve } from "path"
import { static_config } from "../consts"

const mode = "development"

const config: Configuration = {
  mode,
  entry: [],
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["awesome-typescript-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: "[name].js",
    path: resolve(static_config.out_dir),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: "multiple",
  },
}

export const run = async (conf: Configuration) => {
  const stats = await new Promise<Stats>((resolve, reject) =>
    webpack({ ...config, ...conf }).run((err, stats) =>
      err ? reject(err) : resolve(stats),
    ),
  )
  const {
    compilation: { errors, warnings, ...compilation },
  } = stats
  for (const warning of warnings) {
    console.warn(warning)
  }
  for (const error of errors) {
    console.error(error)
  }
}
