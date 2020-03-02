#!/usr/bin/env ts-node --transpile-only
import { big_print, set_defaults } from "./domain_agnostic/node/prelude"
import { extract } from "./github/api"
import { join } from "path"
import { parse } from "./domain_agnostic/vender/yaml"
import { render } from "./render/render"
import { slurp, spit } from "./domain_agnostic/node/fs"
import { static_config, StaticConfig } from "./consts"

const main = async () => {
  console.log(big_print("render start"))
  console.time("pre_render")
  const yml = await slurp(static_config.config)
  const config: StaticConfig = parse(yml)
  const info = JSON.parse(
    await slurp(join(static_config.temp_dir, "info.json")),
  )
  // const info = await extract(config.user, static_config.github_token)
  // await spit(JSON.stringify(info), join(static_config.temp_dir, "info.json"))
  console.timeLog("pre_render", big_print("finished pre-render"))

  console.time("render")
  await render({ config, repos: info.repos })
  console.timeLog("render", big_print("render end"))
}

set_defaults()
main()
