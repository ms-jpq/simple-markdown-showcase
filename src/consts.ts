export const static_config = {
  config: "build.yml",
  src_dir: "src",
  out_dir: "out",
  temp_dir: "temp",
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

export type ContactsConfig = {
  email: string
  github: string
}

export type AsideConfig = {
  contacts: ContactsConfig
}

export type HeaderConfig = {
  link: string
  title: string
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
  sub_path: string
  content: string
}

export type Render<T> = (args: T) => Promise<RenderInstruction[]>
