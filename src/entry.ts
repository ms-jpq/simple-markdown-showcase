#!/usr/bin/env ts-node
import express from "express"
import { extract } from "./github/api"
import { hostname } from "os"
import { parse } from "./domain_agnostic/yaml"
import { promises as fs } from "fs"
import { render } from "./render/render"
import { static_config, StaticConfig } from "./consts"

const main = async () => {
  const yml = (await fs.readFile(static_config.config)).toString()
  const { user, priority_repos }: StaticConfig = parse(yml)
  const info = await extract(user, static_config.github_token)
  const instructions = render({})
  await fs.rmdir(static_config.out_dir, { recursive: true })
  await fs.mkdir(static_config.out_dir, { recursive: true })
  await Promise.all(
    instructions.map(({ sub_path, content }) =>
      fs.writeFile(content, `${static_config.out_dir}/${sub_path}`),
    ),
  )
  const files = express.static(static_config.out_dir)
  express()
    .use(files)
    .listen(static_config.port)
  console.log(`Serving files at:  http://${hostname()}:${static_config.port}`)
}

main()
