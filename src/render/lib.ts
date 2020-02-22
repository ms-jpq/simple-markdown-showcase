import { Render } from "../consts"
import { slurp } from "../domain_agnostic/fs"

export const resource: Render<string[]> = (src) =>
  Promise.all(
    src.map(async (sub_path) => ({
      sub_path,
      content: await slurp(sub_path),
    })),
  )
