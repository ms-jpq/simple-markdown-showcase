import React from "react"
import { BodyProps, Page } from "./layout/layout"
import { flat_map } from "../domain_agnostic/isomorphic/list"
import { id } from "../domain_agnostic/isomorphic/prelude"
import { join, relative } from "../domain_agnostic/node/path"
import { localize_image } from "./image_optimize"
import { map, sort_by, unique_by } from "../domain_agnostic/isomorphic/list"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { render as render_contactme } from "./pages/contact_me"
import { RenderInstruction, Repo, static_config, StaticConfig } from "../consts"
import { renderToStaticMarkup } from "react-dom/server"
import { run as run_parcel } from "./parcel"
import { spit } from "../domain_agnostic/node/fs"

const render_page = async ({
  js: local_js,
  css: local_css,
  title,
  path,
  page,
  page_name,
  body,
}: RenderInstruction & { body: BodyProps }) => {
  const sub_path = join(static_config.out_dir, path)
  const js = map(
    (js) => relative(sub_path, join(static_config.src_dir, "js", `${js}.ts`)),
    local_js,
  )
  const css = map(
    (css) =>
      relative(sub_path, join(static_config.src_dir, "css", `${css}.scss`)),
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
    sub_path: join(sub_path, page_name),
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
  md_strings: {
    aside: string
    footer: string
    about_me: string
    contact_me: string
  }
}

export const render = async ({ config, repos, md_strings }: RenderProps) => {
  const sorted = sort_by((r) => r.idx, repos)
  const pages = await Promise.all([
    render_404({}),
    render_index({ config, repos }),
    render_aboutme({ md_line: md_strings.about_me }),
    render_contactme({
      contacts: config.aside.contacts,
      md_line: md_strings.contact_me,
    }),
    render_repos({ repos: sorted, shim: config.repo_shim }),
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
              md_line: md_strings.aside,
              dest: i.path,
              off: i.page_name !== "index.html",
            },
            footer: {
              md_line: md_strings.footer,
            },
          },
        }),
        instructions,
      ),
    ),
  )
  await commit(commits)
  await run_parcel(instructions)
}
