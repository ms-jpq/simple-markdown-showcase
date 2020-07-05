import { additional_pages, args, static_config, StaticConfig } from "./consts"
import { big_print } from "nda/dist/node/console"
import { extract, GithubInfo } from "./github/api"
import { join } from "path"
import { parse } from "./vender/yaml"
import { render } from "./render/render"
import { rm, slurp, spit, exists } from "nda/dist/node/fs"

const cleanup = () =>
  Promise.all([
    rm(static_config.img_cache_dir),
    rm(static_config.out_dir),
    rm(static_config.dist_dir),
  ])

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

  if (args.prod) {
    console.log("cleaning up...")
    await cleanup()
  }

  const info: GithubInfo = await (async () => {
    const cache_file = join(static_config.temp_dir, "info.json")
    const cached = await exists(cache_file)
    const pull = async () => {
      const fresh = await extract(config.user, static_config.github_token)
      await spit(JSON.stringify(fresh), cache_file)
      return fresh
    }
    if (args.prod || !cached) {
      return pull()
    } else {
      const cached = await slurp(cache_file)
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
