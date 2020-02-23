#!/usr/bin/env ts-node
import { big_print } from "./domain_agnostic/prelude"
import { CommitInstruction, static_config, StaticConfig } from "./consts"
import { extract } from "./github/api"
import { map, unique_by } from "./domain_agnostic/list"
import { mkdir, rmdir, slurp, spit } from "./domain_agnostic/fs"
import { parse } from "./domain_agnostic/yaml"
import { render } from "./render/render"

const commit = async (instructions: CommitInstruction[]) => {
  await rmdir(static_config.out_dir)
  await mkdir(static_config.out_dir)
  const unique = unique_by((i) => i.sub_path, instructions)
  await Promise.all(
    map(
      ({ sub_path, content }) =>
        spit(content, `${static_config.out_dir}/${sub_path}`),
      unique,
    ),
  )
}

const main = async () => {
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
  const instructions = await render({ config, repos: info.repos })
  await commit(instructions)
  console.timeLog("render", big_print("finished rendering"))
}

main()
