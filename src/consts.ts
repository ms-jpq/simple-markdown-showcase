export const local_resources = {
  config: "projects.yml",
}

export const repo_resources = {
  read_me: "README.md",
  build_spec: "_build_spec.yml",
}

export const additional_pages = {
  index: "pages/index.md",
  about_me: "pages/about_me.md",
  contact_me: "pages/contact_me.md",
}

export type BuildSpec = {}

export type Repo = {
  build_spec?: BuildSpec
  full_name: string
  created_at: Date
  updated_at: Date
  read_me: string
}

export type RenderInstruction = {
  sub_path: string
  content: string
}

export type Render<T> = (args: T) => RenderInstruction[]
