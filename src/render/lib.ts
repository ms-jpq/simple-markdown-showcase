import { compact_map } from "../domain_agnostic/list"
import { createProgram, CompilerOptions, WriteFileCallback } from "typescript"
import { id } from "../domain_agnostic/prelude"
import { Render, RenderInstruction } from "../consts"
import { render, Result } from "node-sass"
import { renderToString } from "react-dom/server"
import { slurp } from "../domain_agnostic/fs"
import { static_config } from "../consts"
import { relative } from "path"

export const render_page = (
  page: React.ReactElement,
  path: string,
): RenderInstruction => ({
  sub_path: `${path}/index.html`,
  content: renderToString(page),
})

const css_cache: Record<string, RenderInstruction[]> = {}
export const render_css: Render<string> = async (path) => {
  if (css_cache[path]) {
    return css_cache[path]
  }

  const file = `${static_config.src_dir}/scss/${path}.scss`
  const { css, map } = await new Promise<Result>((resolve, reject) =>
    render({ file, sourceMap: true }, (err, res) =>
      err ? reject(err) : resolve(res),
    ),
  )
  const sub_path = `css/${path}.css`
  const res = compact_map(id, [
    { sub_path, content: css.toString() },
    map ? { sub_path: `${sub_path}.map`, content: map.toString() } : undefined,
  ])

  return (css_cache[path] = res)
}

const js_cache: Record<string, RenderInstruction[]> = {}
export const render_js: Render<string> = async (path) => {
  if (js_cache[path]) {
    return js_cache[path]
  }
  const res: RenderInstruction[] = []
  const ts_write: WriteFileCallback = (path, content) => {
    const sub_path = relative(static_config.src_dir, path)
    res.push({ sub_path, content })
  }

  const rootNames = [`${static_config.src_dir}/js/${path}.ts`]
  const ts_config = await slurp(static_config.ts_config)
  const options: CompilerOptions = JSON.parse(ts_config)
  const program = createProgram({ rootNames, options })
  program.emit(undefined, ts_write)
  return (js_cache[path] = res)
}
