import React from "react"
import { BodyProps, Page } from "../layout/layout"
import { flat_map, map } from "../../domain_agnostic/list"
import { id } from "../../domain_agnostic/prelude"
import { Markdown } from "../layout/md"
import { RenderPage, Repo, static_config } from "../../consts"

export type RepoProps = Pick<Repo, "read_me" | "updated_at">

const Repo = ({ read_me }: RepoProps) => (
  <div>
    <Markdown content={read_me} />
  </div>
)

const parse_title = (read_me: string) => {
  const title = ""
  return title
}

const entry = "pages/repo.ts"

const render_repo: RenderPage<Repo & BodyProps> = async ({
  name: path,
  read_me,
  updated_at,
  ...body
}) => {
  const title = parse_title(read_me)
  const page = (
    <Page head={{ title, entry }} body={body}>
      <Repo read_me={read_me} updated_at={updated_at} />
    </Page>
  )

  return [{ entry, path, page }]
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
