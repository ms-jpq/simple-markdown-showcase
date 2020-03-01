import cn from "classnames"
import React from "react"
import { flat_map, map } from "../../domain_agnostic/list"
import { id, str } from "../../domain_agnostic/prelude"
import { Markdown } from "../layout/md"
import { RenderPage, Repo } from "../../consts"

export type RepoProps = Pick<
  Repo,
  "read_me" | "html_url" | "updated_at" | "created_at"
>

const Repo = ({ read_me, html_url, created_at, updated_at }: RepoProps) => (
  <React.Fragment>
    <section className={cn("repo-header", "flex-row")}>
      <a href={html_url}>
        <button className={cn("big-button")}>
          View on Github <i className="fab fa-github"></i>
        </button>
      </a>
    </section>
    <section className={cn("repo-markdown", "flex-row")}>
      <Markdown content={read_me} />
    </section>
    <section className={cn("repo-footer", "flex-row", "hidden")}>
      <span>
        Created at:{" "}
        <time dateTime={str(created_at)}>
          {new Date(created_at).toLocaleDateString()}
        </time>
      </span>
      <span>
        Updated at:{" "}
        <time dateTime={str(updated_at)}>
          {new Date(updated_at).toLocaleDateString()}
        </time>
      </span>
    </section>
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
  html_url,
  created_at,
  updated_at,
}) => {
  const title = parse_title(read_me)
  const page = (
    <main className={cn("flex-col")}>
      <Repo
        read_me={read_me}
        html_url={html_url}
        created_at={created_at}
        updated_at={updated_at}
      />
    </main>
  )
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
