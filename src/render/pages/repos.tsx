import React from "react"
import { flat_map, map } from "../../domain_agnostic/list"
import { id } from "../../domain_agnostic/prelude"
import { Markdown } from "../layout/md"
import { RenderPage, Repo, static_config } from "../../consts"

export type RepoProps = Pick<Repo, "read_me" | "updated_at">

const Repo = ({ read_me }: RepoProps) => (
  <React.Fragment>
    <Markdown content={read_me} />
  </React.Fragment>
)

const parse_title = (read_me: string) => {
  const title = ""
  return title
}

const js = ["pages/repo"]
const css = ["pages/repo"]
const page_name = "index.html"

const render_repo: RenderPage<Repo> = async ({
  name: path,
  read_me,
  updated_at,
}) => {
  const title = parse_title(read_me)
  const page = <main>{<Repo read_me={read_me} updated_at={updated_at} />}</main>
  return [{ js, css, title, path, page_name, page }]
}

export type RenderProps = {
  repos: Repo[]
}

export const render: RenderPage<RenderProps> = async ({ repos }) => {
  const pages = await Promise.all(
    map((repo) => render_repo({ ...repo }), repos),
  )
  const renderings = flat_map(id, pages)
  return renderings
}
