import React from "react"
import { BigButton } from "../layout/components/big_button"
import { cn } from "nda/dist/isomorphic/dom"
import { flat_map, map } from "nda/dist/isomorphic/list"
import { GithubForks, GithubStars } from "../layout/components/github"
import { id, str } from "nda/dist/isomorphic/prelude"
import { Markdown } from "../layout/markdown"
import { RenderPage, Repo } from "../../consts"

export type RepoProps = Pick<
  Repo,
  | "read_me"
  | "html_url"
  | "updated_at"
  | "created_at"
  | "stargazers_count"
  | "forks_count"
>

const Repo = ({
  read_me,
  html_url,
  created_at,
  updated_at,
  stargazers_count,
  forks_count,
}: RepoProps) => (
  <React.Fragment>
    <section className={cn("repo-header", "d-grid", "ji-end", "m-auto")}>
      <GithubStars stars={stargazers_count} />
      <GithubForks forks={forks_count} />
      <a href={html_url} className={cn("invis-link")}>
        <BigButton>
          View on Github <i className="fab fa-github"></i>
        </BigButton>
      </a>
    </section>
    <section className={cn("repo-body", "d-grid", "m-auto")}>
      <Markdown content={read_me} />
    </section>
    <section
      className={cn("repo-footer", "d-grid", "ji-end", "m-auto", "hidden")}
    >
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

const js = ["layout"]
const css = ["pages/repo"]
const page_name = "index.html"

export type ShimProps = { shim: string }

const render_repo: RenderPage<Repo & ShimProps> = async ({
  title,
  desc,
  shim,
  name,
  read_me,
  html_url,
  created_at,
  updated_at,
  stargazers_count,
  forks_count,
}) => {
  const path = `${shim}${name}`
  const page = (
    <Repo
      read_me={read_me}
      html_url={html_url}
      created_at={created_at}
      updated_at={updated_at}
      stargazers_count={stargazers_count}
      forks_count={forks_count}
    />
  )
  return [{ js, css, title, desc, path, page_name, page }]
}

export type RenderProps = {
  repos: Repo[]
} & ShimProps

export const render: RenderPage<RenderProps> = async ({ repos, shim }) => {
  const pages = await Promise.all(
    map((repo) => render_repo({ ...repo, shim }), repos),
  )
  const renderings = flat_map(id, pages)
  return renderings
}
