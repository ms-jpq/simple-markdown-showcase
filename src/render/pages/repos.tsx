import React from "react"
import { BodyProps, Page } from "../layout/layout"
import { flat_map, map } from "../../domain_agnostic/list"
import { id } from "../../domain_agnostic/prelude"
import { Markdown } from "../layout/md"
import { Render, Repo } from "../../consts"
import { renderToString } from "react-dom/server"
import { resources } from "../lib"

export type RepoProps = Pick<Repo, "read_me" | "updated_at">

const Repo = ({ read_me }: RepoProps) => (
  <div>{<Markdown content={read_me} />}</div>
)

const parse_title = (read_me: string) => {
  const title = ""
  return title
}

const render_repo: Render<Repo & BodyProps> = async ({
  name,
  read_me,
  updated_at,
  ...body
}) => {
  const title = parse_title(read_me)
  const js = [""]
  const css = ["css/layout.css"]
  const addendum = await resources([...css])
  const page = (
    <Page head={{ title, js, css }} body={body}>
      {[<Repo read_me={read_me} updated_at={updated_at} />]}
    </Page>
  )
  const page_content = {
    sub_path: `${name}/index.html`,
    content: renderToString(page),
  }

  return [page_content, ...addendum]
}

export type RenderProps = {
  body: BodyProps
  repos: Repo[]
}

export const render: Render<RenderProps> = async ({ repos, body }) => {
  const pages = await Promise.all(
    map((repo) => render_repo({ ...repo, ...body }), repos),
  )
  const renderings = flat_map(id, pages)
  return renderings
}
