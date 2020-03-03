import fetch from "node-fetch"
import md5 from "crypto-js/md5"
import sharp from "sharp"
import { any, filter, join, last } from "../domain_agnostic/isomorphic/list"
import { basename, dirname, extname } from "path"
import { exists, sip, spit } from "../domain_agnostic/node/fs"
import { imageSize } from "image-size"
import { join as path_join } from "path"
import { JSDOM } from "jsdom"
import { map } from "../domain_agnostic/isomorphic/list"
import { relative } from "path"
import { static_config } from "../consts"

const resize_image = async (path: string) => {
  const buffer = await sip(path)
  const { width } = imageSize(buffer)
  if (width === undefined) {
    throw new Error("missing image")
  }
  const ext = extname(path)
  const file_name = path_join(dirname(path), basename(path)).replace(
    new RegExp(`\\${ext}$`),
    "",
  )
  const widths = filter((s) => s <= width, [
    ...static_config.img.target_widths,
    width,
  ])
  const src_set = await Promise.all(
    map(
      async (width) => ({
        new_name: `${file_name}-${width}w${ext}`,
        width,
      }),
      widths,
    ),
  )
  await Promise.all(
    map(async (s) => {
      const has = await exists(s.new_name)
      if (!has) {
        await sharp(buffer)
          .resize({ width: s.width })
          .toFile(s.new_name)
      }
    }, src_set),
  )
  return src_set
}

const cache_image = (sub_path: string) => async (img: HTMLImageElement) => {
  const path = path_join(
    static_config.img_cache_dir,
    `${md5(img.src).toString()}-${basename(img.src)}`,
  )
  const img_exists = await exists(path)
  if (!img_exists) {
    const image = await (await fetch(img.src)).buffer()
    await spit(image, path)
  }
  const new_sizes = await resize_image(path)
  const src = last(new_sizes)
  img.src = relative(sub_path, src!.new_name)
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
