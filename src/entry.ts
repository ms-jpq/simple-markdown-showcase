import { extract } from "./github/api"
import { parse } from "./domain_agnostic/yaml"
import { slurp } from "./domain_agnostic/fs"
import { local_resources } from "./consts"

export type RepoConfig = {
  name: string
}

export type Config = {
  user: string
  priority_repos: RepoConfig[]
}

const main = async () => {
  const yml = await slurp(local_resources.config)
  const { user, priority_repos }: Config = parse(yml)
  const info = await extract(user)
}

main()
