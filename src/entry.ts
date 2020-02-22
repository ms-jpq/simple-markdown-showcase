#!/usr/bin/env ts-node
import express from "express"
import { extract } from "./github/api"
import { hostname } from "os"
import { parse } from "./domain_agnostic/yaml"
import { render } from "./render/render"
import { rmdir, mkdir, slurp, spit } from "./domain_agnostic/fs"
import { static_config, StaticConfig, RenderInstruction } from "./consts"

const commit = async (instructions: RenderInstruction[]) => {
  await rmdir(static_config.out_dir)
  await mkdir(static_config.out_dir)
  await Promise.all(
    instructions.map(({ sub_path, content }) =>
      spit(content, `${static_config.out_dir}/${sub_path}`),
    ),
  )
}

const srv = () => {
  const files = express.static(static_config.out_dir)
  express()
    .use(files)
    .listen(static_config.port)
  console.log(`Serving files at:  http://${hostname()}:${static_config.port}`)
}

const main = async () => {
  const yml = await slurp(static_config.config)
  const config: StaticConfig = parse(yml)
  const info = JSON.parse(await slurp(`${static_config.temp_dir}/info.json`))
  // const info = await extract(config.user, static_config.github_token)
  // await spit(
  //   JSON.stringify(info),
  //   `${static_config.temp_dir}/info.json`,
  // )
  const instructions = await render({ config, repos: info.repos })
  await commit(instructions)
  srv()
}

main()
