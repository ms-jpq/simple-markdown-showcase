import React from "react"
import { renderToString } from "react-dom/server"
import { Page, BodyProps } from "../layout/layout"
import { Render, Repo, RenderInstruction } from "../../consts"
import { Markdown } from "../layout/md"

export type RepoProps = Pick<Repo, "read_me" | "updated_at">

const Repo = ({ read_me }: RepoProps) => (
  <div>{<Markdown content={read_me} />}</div>
)

const parse_title = (read_me: string) => {
  const title = ""
  return title
}

const render_repo = ({
  name,
  read_me,
  updated_at,
  ...body
}: Repo & BodyProps): RenderInstruction[] => {
  const title = parse_title(read_me)
  const js = [""]
  const css = [""]
  const page_subpath = `${name}/index.html`
  const page = (
    <Page head={{ title, js, css }} body={body}>
      {[<Repo read_me={read_me} updated_at={updated_at} />]}
    </Page>
  )
  const page_content = renderToString(page)

  return [{ sub_path: page_subpath, content: page_content }]
}

export type RenderProps = {
  body: BodyProps
  repos: Repo[]
}

export const render: Render<RenderProps> = ({ repos, body }) => {
  const pages = repos.flatMap((repo) => render_repo({ ...repo, ...body }))
  return pages
}
