import { BodyProps } from "./layout/layout"
import { compact_map, map, unique_by } from "../domain_agnostic/list"
import { flat_map } from "../domain_agnostic/list"
import { id } from "../domain_agnostic/prelude"
import { mkdir, rmdir, slurp, spit } from "../domain_agnostic/fs"
import { relative } from "path"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { renderToStaticMarkup } from "react-dom/server"
import {
  static_config,
  CommitInstruction,
  RenderInstruction,
  Repo,
  StaticConfig,
} from "../consts"

const render_page = ({ path, page }: RenderInstruction) => ({
  sub_path: `${path}/index.html`,
  content: renderToStaticMarkup(page),
})

export type RenderProps = {
  config: StaticConfig
  repos: Repo[]
}

const commit = async (instructions: CommitInstruction[]) => {
  await rmdir(static_config.out_dir)
  await mkdir(static_config.out_dir)
  const unique = unique_by((i) => i.sub_path, instructions)
  await Promise.all(
    map(
      ({ sub_path, content }) =>
        spit(content, `${static_config.out_dir}/${sub_path}`),
      unique,
    ),
  )
}

export const render = async ({ config, repos }: RenderProps) => {
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
  const commits = map(render_page, instructions)
  await commit(commits)
}
