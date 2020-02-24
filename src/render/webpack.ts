import webpack, { Configuration, Entry, Stats } from "webpack"
import { id } from "../domain_agnostic/prelude"
import { map, unique_by, flat_map } from "../domain_agnostic/list"
import { of_list } from "../domain_agnostic/record"
import { RenderInstruction, static_config } from "../consts"
import { resolve } from "path"

const mode = "development"

const config: Configuration = {
  mode,
  entry: {},
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
    filename: "js/[name].js",
    path: resolve(static_config.out_dir),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: "single",
  },
}

export const run = async (instructions: RenderInstruction[]) => {
  const entries = flat_map(
    (i) =>
      map((js) => [js, resolve(`${static_config.src_dir}/js/${js}.ts`)], i.js),
    unique_by(id, instructions),
  )
  const entry = of_list<Entry>(entries as [string, string][])
  const stats = await new Promise<Stats>((resolve, reject) =>
    webpack({ ...config, entry }).run((err, stats) =>
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
