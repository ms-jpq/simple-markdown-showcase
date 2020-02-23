import { BodyProps } from "./layout/layout"
import { compact_map, map, unique_by } from "../domain_agnostic/list"
import { CompilerOptions, createProgram, WriteFileCallback } from "typescript"
import { flat_map } from "../domain_agnostic/list"
import { id } from "../domain_agnostic/prelude"
import { reconciliate } from "../domain_agnostic/record"
import { relative } from "path"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { render as render_scss, Result } from "node-sass"
import { RenderPageInstruction, static_config } from "../consts"
import { renderToStaticMarkup } from "react-dom/server"
import { slurp } from "../domain_agnostic/fs"
import {
  CommitInstruction,
  Render,
  RenderInstruction,
  Repo,
  StaticConfig,
} from "../consts"

const render_page: Render<RenderPageInstruction> = async ({ path, page }) => [
  {
    sub_path: `${path}/index.html`,
    content: renderToStaticMarkup(page),
  },
]

const render_css: Render<string> = async (path) => {
  const file = `${static_config.src_dir}/${path}.scss`
  const { css, map } = await new Promise<Result>((resolve, reject) =>
    render_scss({ file, sourceMap: true }, (err, res) =>
      err ? reject(err) : resolve(res),
    ),
  )
  const sub_path = `${path}.css`
  return compact_map(id, [
    { sub_path, content: css.toString() },
    map ? { sub_path: `${sub_path}.map`, content: map.toString() } : undefined,
  ])
}

const render_js: Render<string> = async (path) => {
  const res: CommitInstruction[] = []
  const ts_write: WriteFileCallback = (path, content) => {
    const sub_path = `${relative(static_config.src_dir, path)}`
    res.push({ sub_path, content })
  }

  const rootNames = [`${static_config.src_dir}/${path}.ts`]
  const [ts_config, ts_config_web] = await Promise.all([
    slurp(static_config.ts_config),
    slurp(static_config.ts_config_web),
  ])
  const { extends: _, ...options }: CompilerOptions = reconciliate(
    JSON.parse(ts_config),
    JSON.parse(ts_config_web),
  )
  console.log(options)
  const program = createProgram({ rootNames, options })
  program.emit(undefined, ts_write)
  return res
}

const render_npm_resource: Render<string> = async (sub_path) => [
  {
    sub_path: sub_path,
    content: await slurp(sub_path),
  },
]

const execute_instructions = async (instructions: RenderInstruction[]) => {
  const js_instructions = unique_by(
    id,
    flat_map((i) => i.local_js, instructions),
  )
  const css_instructions = unique_by(
    id,
    flat_map((i) => i.local_css, instructions),
  )
  const page_instructions = flat_map((i) => i.pages, instructions)
  const npm_instructions = flat_map(
    (i) => [
      ...map((j) => `${j}.js`, i.npm_js),
      ...map((c) => `${c}.css`, i.npm_css),
    ],
    instructions,
  )
  const commit_instructions = await Promise.all([
    Promise.all(map(render_page, page_instructions)),
    Promise.all(map(render_js, js_instructions)),
    Promise.all(map(render_css, css_instructions)),
    Promise.all(map(render_npm_resource, npm_instructions)),
  ])

  return flat_map(id, flat_map(id, commit_instructions))
}

export type RenderProps = {
  config: StaticConfig
  repos: Repo[]
}

export const render: Render<RenderProps> = async ({ config, repos }) => {
  const body: BodyProps = {
    ...config,
  }
  const pages = await Promise.all([
    render_404({ body }),
    render_index({ body, config, repos }),
    render_aboutme({ body }),
    render_repos({ body, repos }),
  ])
  const instructions = flat_map(id, pages)
  return execute_instructions(instructions)
}
