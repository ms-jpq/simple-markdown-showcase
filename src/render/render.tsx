import fetch from "node-fetch"
import md5 from "crypto-js/md5"
import React from "react"
import { basename } from "path"
import { BodyProps, Page } from "./layout/layout"
import { exists, mkdir, rmdir, spit } from "../domain_agnostic/fs"
import { flat_map } from "../domain_agnostic/list"
import { id } from "../domain_agnostic/prelude"
import { JSDOM } from "jsdom"
import { map, unique_by } from "../domain_agnostic/list"
import { relative } from "path"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { RenderInstruction, Repo, static_config, StaticConfig } from "../consts"
import { renderToStaticMarkup } from "react-dom/server"
import { run as run_parcel } from "./parcel"

const cache_image = (sub_path: string) => async (img: HTMLImageElement) => {
  const path = `${static_config.img_cache_dir}/${md5(
    img.src,
  ).toString()}-${basename(img.src)}`
  const img_exists = await exists(path)
  if (!img_exists) {
    const image = await (await fetch(img.src)).blob()
    spit(image, path)
  }
  img.src = relative(sub_path, path)
}

const localize_image = async (sub_path: string, html: string) => {
  const cache = cache_image(sub_path)
  const dom = new JSDOM(html)
  const images = [...dom.window.document.querySelectorAll("img")]
  await Promise.all(map(cache, images))
  return dom.serialize()
}

const render_page = async ({
  js: local_js,
  css: local_css,
  title,
  path,
  page,
  body,
}: RenderInstruction & { body: BodyProps }) => {
  const sub_path = `${static_config.out_dir}/${path}`
  const js = map(
    (js) => relative(sub_path, `${static_config.src_dir}/js/${js}.ts`),
    local_js,
  )
  const css = map(
    (css) => relative(sub_path, `${static_config.src_dir}/css/${css}.scss`),
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
    sub_path: `${sub_path}/index.html`,
    content: optimized,
  }
}

type CommitInstruction = {
  sub_path: string
  content: string
}

const commit = async (instructions: CommitInstruction[]) => {
  await Promise.all([
    rmdir(static_config.out_dir),
    rmdir(static_config.dist_dir),
  ])
  await mkdir(static_config.out_dir)
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
  const body: BodyProps = {
    ...config,
  }
  const pages = await Promise.all([
    render_404({}),
    render_index({ config, repos }),
    render_aboutme({}),
    render_repos({ repos }),
  ])
  const instructions = flat_map(id, pages)
  const commits = await Promise.all(
    map(
      render_page,
      map((i) => ({ ...i, body }), instructions),
    ),
  )
  await commit(commits)
  await run_parcel(instructions)
}
