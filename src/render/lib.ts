import { map } from "../domain_agnostic/list"
import { Render, RenderInstruction } from "../consts"
import { renderToString } from "react-dom/server"
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

export const render_page = (
  page: React.ReactElement,
  path: string,
): RenderInstruction => ({
  sub_path: `${path}/index.html`,
  content: renderToString(page),
})
