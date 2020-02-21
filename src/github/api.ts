import fetch from "node-fetch"
import assert from "assert"

export type Repo = {
  full_name: string
  created_at: Date
  updated_at: Date
  readme?: string
}

const github_avatar = async (user: string) => {
  const res = await fetch(`https://avatars.githubusercontent.com/${user}`)
  const data = await res.blob()
  const type = ((data as unknown) as File).type
  assert(type.includes("image/"))
  const ext = type.replace("image/", "")
  return { ext, data }
}

const repo_readme = async (full_name: string) => {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${full_name}/master/README.md`,
    )
    return res.text()
  } catch {
    return undefined
  }
}

const github_repo = async (repo_data: any) => {
  const { full_name, created_at, updated_at } = repo_data
  const repo: Repo = {
    full_name,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at),
    readme: await repo_readme(full_name),
  }
  return repo
}

const github_repos = async (user: string) => {
  const res = await fetch(`https://api.github.com/users/${user}/repos`)
  const repo_data: any[] = await res.json()
  const repos = await Promise.all(repo_data.map(github_repo))
  return repos
}

export const extract = async (user_name: string) => {
  const [avatar, repos] = await Promise.all([
    github_avatar(user_name),
    github_repos(user_name),
  ])
  return {
    user_name,
    avatar,
    repos,
  }
}
