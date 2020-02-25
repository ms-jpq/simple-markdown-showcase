import Bundler, { ParcelOptions } from "parcel-bundler"
import { map } from "../domain_agnostic/list"
import { RenderInstruction, static_config } from "../consts"

const options: ParcelOptions = {
  outDir: `${static_config.dist_dir}`,
  outFile: "index.html",
  publicUrl: "/",
  watch: false,
  cache: true,
}

export const run = async (instructions: RenderInstruction[]) => {
  const entry = map(
    (i) => `${static_config.out_dir}/${i.path}/index.html`,
    instructions,
  )
  const bundler = new Bundler(entry, options)
  await bundler.bundle()
}
