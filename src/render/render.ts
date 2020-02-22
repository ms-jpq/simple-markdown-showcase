import { render as render_404 } from "./pages/404"
import { render as render_index } from "./pages/index"
import { render as render_repos } from "./pages/repos"
import { render as render_aboutme } from "./pages/about_me"
import { Render, Repo } from "../consts"
import {
  BodyProps,
  HeaderProps,
  AsideProps,
  FooterProps,
} from "./layout/layout"

export type RenderProps = {
  repos: Repo[]
}

export const render: Render<RenderProps> = ({ repos }) => {
  const footer: FooterProps = { description: [] }
  const aside: AsideProps = {}
  const header: HeaderProps = {}
  const body: BodyProps = {
    aside,
    header,
    footer
  }
  const pages = [
    render_404({}),
    render_index({}),
    render_aboutme({}),
    render_repos({ repos, body }),
  ]
  return pages.flatMap((a) => a)
}
