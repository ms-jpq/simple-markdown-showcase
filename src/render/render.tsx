import fetch from "node-fetch"
import md5 from "crypto-js/md5"
import React from "react"
import sharp from "sharp"
import { any, filter, flat_map, join, last } from "../domain_agnostic/list"
import { basename, dirname, extname } from "path"
import { BodyProps, Page } from "./layout/layout"
import { exists, rmdir, sip, spit } from "../domain_agnostic/fs"
import { id } from "../domain_agnostic/prelude"
import { imageSize } from "image-size"
import { join as path_join } from "path"
import { JSDOM } from "jsdom"
import { map, unique_by } from "../domain_agnostic/list"
import { relative } from "path"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { render as render_contactme } from "./pages/contact_me"
import { renderToStaticMarkup } from "react-dom/server"
import { run as run_parcel } from "./parcel"
import {
  img_config,
  RenderInstruction,
  Repo,
  static_config,
  StaticConfig,
} from "../consts"

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
  const widths = filter((s) => s <= width, [...img_config.target_widths, width])
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
        const buff = await sharp(buffer)
          .resize({ width: s.width })
          .toBuffer()
        await spit(buff, s.new_name)
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
    return any((u) => u === uri.host, img_config.localize_domains)
  } catch (err) {
    console.error(err)
    console.log(src)
    return false
  }
}

const localize_image = async (sub_path: string, html: string) => {
  const cache = cache_image(sub_path)
  const dom = new JSDOM(html)
  const images = [...dom.window.document.querySelectorAll("img")]
  const target_images = filter(filter_localize, images)
  await Promise.all(map(cache, target_images))
  return dom.serialize()
}

const render_page = async ({
  js: local_js,
  css: local_css,
  title,
  path,
  page,
  page_name,
  body,
}: RenderInstruction & { body: BodyProps }) => {
  const sub_path = path_join(static_config.out_dir, path)
  const js = map(
    (js) =>
      relative(sub_path, path_join(static_config.src_dir, "js", `${js}.ts`)),
    local_js,
  )
  const css = map(
    (css) =>
      relative(
        sub_path,
        path_join(static_config.src_dir, "css", `${css}.scss`),
      ),
    local_css,
  )
  const content = (
    <Page head={{ title, js, css }} body={body}>
      {page}
    </Page>
  )
  const html = renderToStaticMarkup(content)
  const optimized = await localize_image(sub_path, html)
  return {
    sub_path: path_join(sub_path, page_name),
    content: optimized,
  }
}

type CommitInstruction = {
  sub_path: string
  content: string
}

const commit = async (instructions: CommitInstruction[]) => {
  const unique = unique_by((i) => i.sub_path, instructions)
  await Promise.all(
    map(({ sub_path, content }) => spit(content, sub_path), unique),
  )
}

export type RenderProps = {
  config: StaticConfig
  repos: Repo[]
}

export const render = async ({ config, repos }: RenderProps) => {
  const pages = await Promise.all([
    render_404({}),
    render_index({ config, repos }),
    render_aboutme({}),
    render_contactme({}),
    render_repos({ repos }),
  ])
  const instructions = flat_map(id, pages)
  const commits = await Promise.all(
    map(
      render_page,
      map(
        (i) => ({
          ...i,
          body: {
            ...config,
            aside: {
              ...config.aside,
              dest: i.path,
              off: i.page_name !== "index.html",
            },
          },
        }),
        instructions,
      ),
    ),
  )
  // await Promise.all([
  //   rmdir(static_config.out_dir),
  //   rmdir(static_config.dist_dir),
  // ])
  await commit(commits)
  await run_parcel(instructions)
}
