import fetch from "node-fetch"
import { compact_map, map } from "../domain_agnostic/isomorphic/list"
import { id } from "../domain_agnostic/isomorphic/prelude"
import { parse } from "../domain_agnostic/vender/yaml"
import { Repo, repo_resources, RepoConfig } from "../consts"

const secure_fetch = (uri: string, token?: string) =>
  fetch(uri, { headers: token ? { Authorization: `token ${token}` } : {} })

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
  const { name, full_name, html_url, created_at, updated_at } = repo_data
  const [read_me, config, spec] = await Promise.all([
    repo_resource(full_name, repo_resources.read_me, token),
    repo_resource(full_name, repo_resources.config, token),
    repo_resource(full_name, repo_resources.build_spec, token),
  ])
  if (!read_me || !config) {
    return undefined
  }
  const repo_config: RepoConfig = parse(config)
  const repo: Repo = {
    build_spec: spec ? parse(spec) : undefined,
    name,
    html_url,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at),
    read_me,
    ...repo_config,
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
    const repos = await Promise.all(map(seek, repo_data))
    return compact_map(id, repos)
  } catch (err) {
    console.error(err, repo_data)
    return []
  }
}

export type GithubInfo = { user_name: string; repos: Repo[] }

export const extract = async (
  user_name: string,
  token?: string,
): Promise<GithubInfo> => {
  const repos = await github_repos(user_name, token)
  return {
    user_name,
    repos,
  }
}
