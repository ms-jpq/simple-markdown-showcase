import Bundler, { ParcelOptions } from "parcel-bundler"
import { join } from "path"
import { map } from "../domain_agnostic/list"
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
  console.log(entry)
  const bundler = new Bundler(entry, options)
  await bundler.bundle()
}
