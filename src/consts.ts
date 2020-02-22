export const static_config = {
  config: "_config.yml",
  out_dir: "out",
  temp_dir: "temp",
  port: 8080,
  github_token: process.env["TOKEN"],
}

export const repo_resources = {
  read_me: "README.md",
  build_spec: "_build_spec.yml",
  config: static_config.config,
}

export const additional_pages = {
  about_me: "pages/about_me.md",
  contact_me: "pages/contact_me.md",
}

export type StaticConfig = {
  user: string
  title: string
}

export type RepoConfig = {
  title: string
  showcase: boolean
  desc: string
}

export type BuildSpec = {}

export type Repo = {
  build_spec?: BuildSpec
  config: RepoConfig
  name: string
  full_name: string
  created_at: Date
  updated_at: Date
  read_me: string
}

export type RenderInstruction = {
  sub_path: string
  content: string
}

export type Render<T> = (args: T) => Promise<RenderInstruction[]>
