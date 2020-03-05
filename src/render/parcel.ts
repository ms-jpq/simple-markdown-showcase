import Bundler, { ParcelOptions } from "parcel-bundler"
import { chunk, map } from "nda/dist/isomorphic/list"
import { join } from "nda/dist/node/path"
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

  // const bundler = new Bundler(entry, options)
  // bundler.on("buildError", (err) => {
  //   throw err
  // })
  // await bundler.bundle()

  /*
   * TODO -- Maybe parcel 2.0 will fix this
   *
   * OK so parcel has multiple bugs...
   * This really sucks
   * We need to chunk the entries or else Parcel gets stuck
   * Parcel also renders single file to the wrong location...
   */

  const entries = chunk(static_config.parallelism, entry)
  console.log(entries)
  for (const lst of entries) {
    if (lst.length === 1) {
      lst.push("out/index.html")
    }
    const bundler = new Bundler(lst, options)
    bundler.on("buildError", (err) => {
      throw err
    })
    await bundler.bundle()
  }
}
