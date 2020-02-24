#!/usr/bin/env ts-node
import { big_print } from "./domain_agnostic/prelude"
import { static_config, StaticConfig } from "./consts"
import { extract } from "./github/api"
import { slurp } from "./domain_agnostic/fs"
import { parse } from "./domain_agnostic/yaml"
import { render } from "./render/render"

const main = async () => {
  console.log(big_print("render start"))
  console.time("pre_render")
  const yml = await slurp(static_config.config)
  const config: StaticConfig = parse(yml)
  const info = JSON.parse(await slurp(`${static_config.temp_dir}/info.json`))
  // const info = await extract(config.user, static_config.github_token)
  // await spit(
  //   JSON.stringify(info),
  //   `${static_config.temp_dir}/info.json`,
  // )
  console.timeLog("pre_render", big_print("finished pre-render"))

  console.time("render")
  await render({ config, repos: info.repos })
  console.timeLog("render", big_print("render end"))
}

main()
