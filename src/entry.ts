#!/usr/bin/env ts-node
import { additional_pages, static_config, StaticConfig } from "./consts"
import { big_print } from "nda/dist/node/prelude"
import { drop, fst } from "nda/dist/isomorphic/list"
import { extract, GithubInfo } from "./github/api"
import { join } from "nda/dist/node/path"
import { parse } from "./vender/yaml"
import { render } from "./render/render"
import { rm, slurp, spit } from "nda/dist/node/fs"

const cleanup = () =>
  Promise.all([rm(static_config.out_dir), rm(static_config.dist_dir)])

const main = async () => {
  console.time("pre_render")

  const [yml, aside, footer, about_me, contact_me] = await Promise.all([
    slurp(static_config.config),
    slurp(additional_pages._aside),
    slurp(additional_pages._footer),
    slurp(additional_pages.about_me),
    slurp(additional_pages.contact_me),
  ])

  const config: StaticConfig = parse(yml)

  const argv = drop(2, process.argv)

  if (fst(argv) === "clean") {
    console.log("cleaning up...")
    await cleanup()
  }

  const info: GithubInfo = await (async () => {
    if (fst(argv) === "clean") {
      const fresh = await extract(config.user, static_config.github_token)
      await spit(
        JSON.stringify(fresh),
        join(static_config.temp_dir, "info.json"),
      )
      return fresh
    } else {
      const cached = await slurp(join(static_config.temp_dir, "info.json"))
      return JSON.parse(cached)
    }
  })()

  console.log(big_print("render start"))

  console.timeLog("pre_render", big_print("finished pre-render"))

  console.time("render")
  await render({
    config,
    repos: info.repos,
    md_strings: { about_me, contact_me, aside, footer },
  })
  console.timeLog("render", big_print("render end"))
}

main()
