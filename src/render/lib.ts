import { map } from "../domain_agnostic/list"
import { Render } from "../consts"
import { slurp } from "../domain_agnostic/fs"
import { static_config } from "../consts"

export const resources: Render<string[]> = (src) =>
  Promise.all(
    map(
      async (sub_path) => ({
        sub_path,
        content: await slurp(`${static_config.src_dir}/${sub_path}`),
      }),
      src,
    ),
  )
