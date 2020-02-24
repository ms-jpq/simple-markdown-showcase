import React from "react"
import { BodyProps, Page } from "./layout/layout"
import { compact_map, map, unique_by } from "../domain_agnostic/list"
import { flat_map } from "../domain_agnostic/list"
import { id } from "../domain_agnostic/prelude"
import { mkdir, rmdir, slurp, spit } from "../domain_agnostic/fs"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { renderToStaticMarkup } from "react-dom/server"
import { relative } from "path"
import { run as run_webpack } from "./webpack"
import { run as run_parcel } from "./parcel"
import {
  static_config,
  CommitInstruction,
  RenderInstruction,
  Repo,
  StaticConfig,
} from "../consts"

// const render_css: Render<string> = async (path) => {
//   const file = `${static_config.src_dir}/scss/${path}.scss`
//   const { css, map } = await new Promise<Result>((resolve, reject) =>
//     render_scss({ file, sourceMap: true }, (err, res) =>
//       err ? reject(err) : resolve(res),
//     ),
//   )
//   const sub_path = `css/${path}.css`
//   return compact_map(id, [
//     { sub_path, content: css.toString() },
//     map ? { sub_path: `${sub_path}.map`, content: map.toString() } : undefined,
//   ])
// }

const render_page = ({
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
  const css = map((css) => `${css}`, local_css)
  const content = (
    <Page head={{ title, js, css }} body={body}>
      {page}
    </Page>
  )
  return {
    sub_path: `${sub_path}/index.html`,
    content: renderToStaticMarkup(content),
  }
}

const commit = async (instructions: CommitInstruction[]) => {
  await rmdir(static_config.out_dir)
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
  const commits = map(
    render_page,
    map((i) => ({ ...i, body }), instructions),
  )
  await commit(commits)
  await run_parcel(instructions)
}
