import fetch from "node-fetch"
import assert from "assert"
import { parse } from "../domain_agnostic/yaml"
import { Repo, repo_resources } from "../consts"

const secure_fetch = (uri: string, token?: string) =>
  fetch(uri, { headers: token ? { Authorization: `token ${token}` } : {} })

const github_avatar = async (user: string, token?: string) => {
  const res = await secure_fetch(
    `https://avatars.githubusercontent.com/${user}`,
    token,
  )
  const data = await res.blob()
  const type = ((data as unknown) as File).type
  assert(type.includes("image/"))
  const ext = type.replace("image/", "")
  return { ext, data }
}

const repo_resource = async (
  full_name: string,
  resource: string,
  token?: string,
) => {
  try {
    const res = await secure_fetch(
      `https://raw.githubusercontent.com/${full_name}/master/${resource}`,
      token,
    )
    return res.ok ? res.text() : undefined
  } catch {
    return undefined
  }
}

const github_repo = (token?: string) => async (repo_data: any) => {
  const { name, full_name, created_at, updated_at } = repo_data
  const [read_me, config, spec] = await Promise.all([
    repo_resource(full_name, repo_resources.read_me, token),
    repo_resource(full_name, repo_resources.config, token),
    repo_resource(full_name, repo_resources.build_spec, token),
  ])
  if (!read_me || !config) {
    return undefined
  }
  const repo: Repo = {
    build_spec: spec ? parse(spec) : undefined,
    config: parse(config),
    name,
    full_name,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at),
    read_me,
  }
  return repo
}

const github_repos = async (user: string, token?: string) => {
  const res = await secure_fetch(
    `https://api.github.com/users/${user}/repos`,
    token,
  )
  const repo_data: any[] = await res.json()
  const seek = github_repo(token)
  try {
    const repos = await Promise.all(repo_data.map(seek))
    return repos.flatMap((r) => (r ? [r] : []))
  } catch (err) {
    console.error(err, repo_data)
    return []
  }
}

export const extract = async (user_name: string, token?: string) => {
  const [avatar, repos] = await Promise.all([
    github_avatar(user_name, token),
    github_repos(user_name, token),
  ])
  return {
    user_name,
    avatar,
    repos,
  }
}
