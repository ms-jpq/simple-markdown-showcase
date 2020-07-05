import fetch from "node-fetch"
import { assert } from "nda/dist/isomorphic/assertion"
import { compact_map, map } from "nda/dist/isomorphic/iterator"
import { id } from "nda/dist/isomorphic/prelude"
import { of_list } from "nda/dist/isomorphic/record"
import { parse } from "../vender/yaml"
import { Repo, repo_resources, RepoConfig } from "../consts"

const secure_fetch = (uri: string, token?: string) =>
  fetch(uri, { headers: token ? { Authorization: `token ${token}` } : {} })

const repo_resource = async (
  branch: string,
  full_name: string,
  resource: string,
  token?: string,
) => {
  try {
    const res = await secure_fetch(
      `https://raw.githubusercontent.com/${full_name}/${branch}/${resource}`,
      token,
    )
    return res.ok ? res.text() : undefined
  } catch {
    return undefined
  }
}

const github_color = async () => {
  const data = await (
    await fetch(
      "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml",
    )
  ).text()
  const yml = parse(data)
  const record = of_list<Record<string, string>>(
    map(
      ([k, v]) => [k, (v as any)["color"]] as [string, any],
      Object.entries(yml),
    ),
  )
  return record
}

const github_repo = (colours: Record<string, string>, token?: string) => async (
  repo_data: any,
) => {
  const {
    name,
    default_branch,
    full_name,
    html_url,
    created_at,
    updated_at,
    stargazers_count,
    forks_count,
    language,
  } = repo_data
  const [read_me, config, spec] = await Promise.all([
    repo_resource(default_branch, full_name, repo_resources.read_me, token),
    repo_resource(default_branch, full_name, repo_resources.config, token),
    repo_resource(default_branch, full_name, repo_resources.build_spec, token),
  ])
  if (!read_me || !config) {
    return undefined
  }
  const colour = colours[language]
  assert(colour !== undefined)
  const repo_config: RepoConfig = parse(config)
  const repo: Repo = {
    build_spec: spec ? parse(spec) : undefined,
    name,
    html_url,
    stargazers_count,
    forks_count,
    language,
    colour,
    created_at: new Date(created_at),
    updated_at: new Date(updated_at),
    read_me,
    ...repo_config,
  }
  return repo
}

const github_repos = async (user: string, token?: string) => {
  const colors = await github_color()
  const res = await secure_fetch(
    `https://api.github.com/users/${user}/repos`,
    token,
  )
  const repo_data: any[] = await res.json()
  const seek = github_repo(colors, token)
  try {
    const repos = await Promise.all(map(seek, repo_data))
    return [...compact_map(id, repos)]
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
