import Bundler, { ParcelOptions } from "parcel-bundler"
import { map } from "../domain_agnostic/list"
import { RenderInstruction, static_config } from "../consts"

const options: ParcelOptions = {
  outDir: `${static_config.out_dir}/dist`,
  outFile: "index.html",
  publicUrl: "/",
  watch: false,
}

export const run = async (instructions: RenderInstruction[]) => {
  const entry = map(
    (i) => `${static_config.out_dir}/${i.path}/index.html`,
    instructions,
  )
  console.log(entry)
  const bundler = new Bundler(entry, options)
  const bundle = await bundler.bundle()
  console.log(bundle)
}
