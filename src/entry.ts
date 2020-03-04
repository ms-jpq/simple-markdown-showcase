#!/usr/bin/env ts-node
import { additional_pages, static_config, StaticConfig } from "./consts"
import { big_print } from "./domain_agnostic/node/prelude"
import { drop, fst } from "./domain_agnostic/isomorphic/list"
import { extract } from "./github/api"
import { join } from "./domain_agnostic/node/path"
import { parse } from "./domain_agnostic/vender/yaml"
import { render } from "./render/render"
import { rmdir, slurp, spit } from "./domain_agnostic/node/fs"

const cleanup = () =>
  Promise.all([rmdir(static_config.out_dir), rmdir(static_config.dist_dir)])

const main = async () => {
  const argv = drop(2, process.argv)

  if (fst(argv) === "clean") {
    console.log("cleaning up...")
    await cleanup()
  }

  console.log(big_print("render start"))
  console.time("pre_render")

  const [yml, aside, footer, about_me, contact_me] = await Promise.all([
    slurp(static_config.config),
    slurp(additional_pages._aside),
    slurp(additional_pages._footer),
    slurp(additional_pages.about_me),
    slurp(additional_pages.contact_me),
  ])

  const config: StaticConfig = parse(yml)
  // const info = JSON.parse(
  //   await slurp(join(static_config.temp_dir, "info.json")),
  // )
  const info = await extract(config.user, static_config.github_token)
  await spit(JSON.stringify(info), join(static_config.temp_dir, "info.json"))
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
