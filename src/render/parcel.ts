import Bundler, { ParcelOptions } from "parcel-bundler"
import { join } from "path"
import { map, take, chunk } from "../domain_agnostic/list"
import { RenderInstruction, static_config } from "../consts"

const options: ParcelOptions = {
  outDir: `${static_config.dist_dir}`,
  publicUrl: "/",
  detailedReport: false,
  watch: false,
  cache: true,
}

const parallelism = 4

export const run = async (instructions: RenderInstruction[]) => {
  const entry = map(
    (i) => join(static_config.out_dir, i.path, i.page_name),
    instructions,
  )
  const entries = chunk(parallelism, entry)
  console.log(entries)
  for (const lst of entries) {
    const bundler = new Bundler(lst, options)
    await bundler.bundle()
  }
}
