import { extract } from "./github/api"
import { safeLoad } from "js-yaml"
import { slurp } from "./domain_agnostic/fs"

const _config_ = "projects.yml"
const _user_ = "ms-jpq"

export type Config = {
  priority_repos: string[]
}

const main = async () => {
  const yml = await slurp(_config_)
  const config: Config = safeLoad(yml)
  const user = await extract(_user_)
  console.log(config)
}

main()
