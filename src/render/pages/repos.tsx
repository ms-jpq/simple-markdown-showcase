import React from "react"
import { BodyProps, Page } from "../layout/layout"
import { flat_map, map } from "../../domain_agnostic/list"
import { id } from "../../domain_agnostic/prelude"
import { Markdown } from "../layout/md"
import { RenderPage, Repo } from "../../consts"

export type RepoProps = Pick<Repo, "read_me" | "updated_at">

const Repo = ({ read_me }: RepoProps) => (
  <div>{<Markdown content={read_me} />}</div>
)

const parse_title = (read_me: string) => {
  const title = ""
  return title
}

const local_js = ["js/layout"]
const local_css = ["css/pages/repo"]
const npm_js = [] as string[]
const npm_css = [] as string[]
const js = [...npm_js, ...local_js]
const css = [...npm_css, ...local_css]

const render_repo: RenderPage<Repo & BodyProps> = async ({
  name,
  read_me,
  updated_at,
  ...body
}) => {
  const title = parse_title(read_me)
  const page = (
    <Page head={{ title, js, css }} body={body}>
      {[<Repo read_me={read_me} updated_at={updated_at} />]}
    </Page>
  )
  const pages = [{ path: name, page }]

  return [{ local_js, local_css, npm_js, npm_css, pages }]
}

export type RenderProps = {
  body: BodyProps
  repos: Repo[]
}

export const render: RenderPage<RenderProps> = async ({ repos, body }) => {
  const pages = await Promise.all(
    map((repo) => render_repo({ ...repo, ...body }), repos),
  )
  const renderings = flat_map(id, pages)
  return renderings
}
