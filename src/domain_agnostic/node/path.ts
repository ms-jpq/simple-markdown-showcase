import p from "path"

export const basename = p.basename

export const dirname = p.dirname

export const extname = (path: string) => {
  const ext = p.extname(path)
  const file_name = path.slice(path.length, -ext.length)
  return [file_name, ext]
}

export const join = p.join

export const relative = p.relative
