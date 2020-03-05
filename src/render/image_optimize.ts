import fetch from "node-fetch"
import md5 from "crypto-js/md5"
import sharp from "sharp"
import { any, filter, join, last } from "../domain_agnostic/isomorphic/list"
import { exists, sip, spit } from "../domain_agnostic/node/fs"
import { imageSize } from "image-size"
import { JSDOM } from "jsdom"
import { map } from "../domain_agnostic/isomorphic/list"
import { pipe } from "../domain_agnostic/node/sub_process"
import { static_config } from "../consts"
import {
  basename,
  extname,
  join as path_join,
  relative,
  fn_ext,
} from "../domain_agnostic/node/path"

export type ResizeOpts = {
  src: Buffer
  new_name: string
  width: number
  height: number
}

const resize = async ({ src, new_name, width, height }: ResizeOpts) => {
  const has = await exists(new_name)
  if (!has) {
    const ext = extname(new_name)
    const conf = sharp(src).resize({ width, height })
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        await conf.jpeg().toFile(new_name)
        break
      case ".png":
        await conf.png().toFile(new_name)
        break
      case ".gif":
        const args = `--resize ${width}x${height} -o ${new_name}`
        const [stdout, stderr] = await pipe({
          cmd: "gifsicle",
          args: args.split(" "),
          stdin: src,
        })
        const err = stderr.toString()
        if (err) {
          throw new Error(err)
        }
        break
      default:
        throw new Error(`unrecognized format: ${basename(new_name)}`)
    }
  }
}

const resize_image = async (path: string) => {
  const buffer = await sip(path)
  const { width, height } = imageSize(buffer)
  if (width === undefined || height === undefined) {
    throw new Error("missing image")
  }
  const widths = filter((s) => s <= width, [
    ...static_config.img.target_widths,
    width,
  ])
  const [file_name, ext] = fn_ext(path)
  const src_set = map(
    (w) => ({
      src: buffer,
      new_name: `${file_name}-${w}w${ext}`,
      width: w,
      height: Math.round((w / width) * height),
    }),
    widths,
  )

  await Promise.all(map(resize, src_set))
  return src_set
}

const cache_image = (sub_path: string) => async (img: HTMLImageElement) => {
  const path = path_join(
    static_config.img_cache_dir,
    `${md5(img.src).toString()}${extname(img.src)}`,
  )
  const img_exists = await exists(path)
  if (!img_exists) {
    const image = await (await fetch(img.src)).buffer()
    await spit(image, path)
  }
  const new_sizes = await resize_image(path)
  const src = last(new_sizes)
  img.src = relative(sub_path, src!.new_name)
  img.width = src!.width
  img.height = src!.height
  img.srcset = join(
    ",",
    map((s) => `${relative(sub_path, s.new_name)} ${s.width}w`, new_sizes),
  )
}

const filter_localize = ({ src }: HTMLImageElement) => {
  try {
    const uri = new URL(src)
    return any((u) => u === uri.host, static_config.img.localize_domains)
  } catch (err) {
    console.error(err)
    console.log(src)
    return false
  }
}

export const localize_image = async (sub_path: string, html: string) => {
  const cache = cache_image(sub_path)
  const dom = new JSDOM(html)
  const images = [...dom.window.document.querySelectorAll("img")]
  const target_images = filter(filter_localize, images)
  await Promise.all(map(cache, target_images))
  return dom.serialize()
}
