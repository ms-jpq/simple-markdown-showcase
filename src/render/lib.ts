import { flat_map, map, compact_map } from "../domain_agnostic/list"
import { id } from "../domain_agnostic/prelude"
import { Render, RenderInstruction } from "../consts"
import { render, Result } from "node-sass"
import { renderToString } from "react-dom/server"
import { slurp } from "../domain_agnostic/fs"
import { static_config } from "../consts"

export const render_page = (
  page: React.ReactElement,
  path: string,
): RenderInstruction => ({
  sub_path: `${path}/index.html`,
  content: renderToString(page),
})

const render_sass_file: Render<string> = async (path: string) => {
  const file = `${static_config.src_dir}/scss/${path}.scss`
  const { css, map } = await new Promise<Result>((resolve, reject) =>
    render({ file, sourceMap: true }, (err, res) =>
      err ? reject(err) : resolve(res),
    ),
  )
  const sub_path = `css/${path}.css`
  return compact_map(id, [
    { sub_path, content: css.toString() },
    map ? { sub_path: `${sub_path}.map`, content: map.toString() } : undefined,
  ])
}

export const render_css: Render<string[]> = async (src) => {
  const files = await Promise.all(map(render_sass_file, src))
  return flat_map(id, files)
}

export const render_js: Render<string[]> = (src) =>
  Promise.all(
    map(
      async (path) => ({
        sub_path: `js/${path}.js`,
        content: await slurp(`${static_config.src_dir}/js/${path}.ts`),
      }),
      src,
    ),
  )
