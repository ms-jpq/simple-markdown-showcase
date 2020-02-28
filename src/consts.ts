import { ReactElement } from "react"

export const static_config = {
  ts_config: "tsconfig.json",
  ts_config_web: "src/js/tsconfig.json",
  config: "build.yml",
  npm_dir: "node_modules",
  src_dir: "src",
  out_dir: "out",
  dist_dir: "dist",
  temp_dir: "temp",
  img_cache_dir: "img_cache",
  port: 8080,
  github_token: process.env["TOKEN"],
}

export const repo_resources = {
  read_me: "README.md",
  build_spec: "_build_spec.yml",
  config: "_config.yml",
}

export const additional_pages = {
  about_me: "pages/about_me.md",
  contact_me: "pages/contact_me.md",
}

export const img_config = {
  localize_domains: ["raw.githubusercontent.com", "github.com"],
  target_widths: [200, 400, 600, 800],
}

export type ContactsConfig = {
  email: string
  linkedin: string
  github: string
  dockerhub: string
  stackoverflow: string
}

export type AsideConfig = {
  contacts: ContactsConfig
  nav: {
    title: string
    link: string
  }[]
  about_me: { title: string; desc: string[] }
}

export type HeaderConfig = {
  title: string
  menu: string
}

export type FooterConfig = {
  desc: string[]
}

export type StaticConfig = {
  user: string
  title: string
  aside: AsideConfig
  header: HeaderConfig
  footer: FooterConfig
}

export type RepoConfig = {
  title: string
  showcase: boolean
  desc: string
  images: string[]
  display: { hide_details: boolean }
}

export type BuildSpec = {}

export type Repo = {
  build_spec?: BuildSpec
  name: string
  html_url: string
  created_at: Date
  updated_at: Date
  read_me: string
} & RepoConfig

export type RenderInstruction = {
  js: string[]
  css: string[]
  title: string
  path: string
  page_name: string
  page: ReactElement | ReactElement[]
}

export type RenderPage<T> = (args: T) => Promise<RenderInstruction[]>
