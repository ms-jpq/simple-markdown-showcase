import React from "react"
import { cn } from "../../domain_agnostic/isomorphic/dom"
import { flat_map, map } from "../../domain_agnostic/isomorphic/list"
import { id, str } from "../../domain_agnostic/isomorphic/prelude"
import { Markdown } from "../layout/md"
import { RenderPage, Repo } from "../../consts"

export type RepoProps = Pick<
  Repo,
  "read_me" | "html_url" | "updated_at" | "created_at"
>

const Repo = ({ read_me, html_url, created_at, updated_at }: RepoProps) => (
  <React.Fragment>
    <section className={cn("repo-header", "grid")}>
      <a href={html_url} className={cn("invis-link")}>
        <button className={cn("big-button")}>
          View on Github <i className="fab fa-github"></i>
        </button>
      </a>
    </section>
    <section className={cn("repo-markdown", "grid")}>
      <Markdown content={read_me} />
    </section>
    <section className={cn("repo-footer", "grid", "hidden")}>
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

const js = ["pages/repo"]
const css = ["pages/repo"]
const page_name = "index.html"

const render_repo: RenderPage<Repo> = async ({
  title,
  name: path,
  read_me,
  html_url,
  created_at,
  updated_at,
}) => {
  const page = (
    <Repo
      read_me={read_me}
      html_url={html_url}
      created_at={created_at}
      updated_at={updated_at}
    />
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
