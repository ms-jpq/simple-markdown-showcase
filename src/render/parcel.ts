import Bundler, { ParcelOptions } from "parcel-bundler"
import { chunk, map } from "../domain_agnostic/list"
import { join } from "path"
import { RenderInstruction, static_config } from "../consts"

const options: ParcelOptions = {
  outDir: `${static_config.dist_dir}`,
  publicUrl: "/",
  detailedReport: false,
  watch: false,
  cache: true,
}

export const run = async (instructions: RenderInstruction[]) => {
  const entry = map(
    (i) => join(static_config.out_dir, i.path, i.page_name),
    instructions,
  )
  const entries = chunk(static_config.parallelism, entry)
  console.log(entries)
  for (const lst of entries) {
    const bundler = new Bundler(lst, options)
    bundler.on("buildError", (err) => {
      throw err
    })
    await bundler.bundle()
  }
}
