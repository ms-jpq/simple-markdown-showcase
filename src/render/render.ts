import { flat_map } from "../domain_agnostic/list"
import { id } from "../domain_agnostic/prelude"
import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { Render, Repo, StaticConfig } from "../consts"
import {
  BodyProps,
  HeaderProps,
  AsideProps,
  FooterProps,
} from "./layout/layout"

export type RenderProps = {
  config: StaticConfig
  repos: Repo[]
}

export const render: Render<RenderProps> = async ({ config, repos }) => {
  const footer: FooterProps = { description: [] }
  const aside: AsideProps = {}
  const header: HeaderProps = {}
  const body: BodyProps = {
    aside,
    header,
    footer,
  }
  const pages = await Promise.all([
    render_404({ body }),
    render_index({ body, config, repos }),
    render_aboutme({ body }),
    render_repos({ body, repos }),
  ])
  return flat_map(id, pages)
}
