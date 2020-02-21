import fetch from "node-fetch"
import assert from "assert"
import { parse } from "../domain_agnostic/yaml"
import { Repo, repo_resources } from "../consts"

const github_avatar = async (user: string) => {
  const res = await fetch(`https://avatars.githubusercontent.com/${user}`)
  const data = await res.blob()
  const type = ((data as unknown) as File).type
  assert(type.includes("image/"))
  const ext = type.replace("image/", "")
  return { ext, data }
}

const repo_resource = async (full_name: string, resource: string) => {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${full_name}/master/${resource}`,
    )
    return res.text()
  } catch {
    return undefined
  }
}

const github_repo = async (repo_data: any) => {
  const { full_name, created_at, updated_at } = repo_data
  const [read_me, spec] = await Promise.all([
    repo_resource(full_name, repo_resources.read_me),
    repo_resource(full_name, repo_resources.build_spec),
  ])
  if (!read_me) {
    return undefined
  }
  const repo: Repo = {
    build_spec: spec ? parse(spec) : undefined,
    full_name,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at),
    read_me,
  }
  return repo
}

const github_repos = async (user: string) => {
  const res = await fetch(`https://api.github.com/users/${user}/repos`)
  const repo_data: any[] = await res.json()
  try {
    const repos = await Promise.all(repo_data.map(github_repo))
    return repos.flatMap((r) => (r ? [r] : []))
  } catch (err) {
    console.error(err, repo_data)
    return []
  }
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
