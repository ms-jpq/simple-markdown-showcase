import { dirname } from "path"
import { exists as exists_cb, promises as fs } from "fs"

export const exists = (path: string) =>
  new Promise<boolean>((resolve) => exists_cb(path, resolve))

export const mkdir = (dir: string) => fs.mkdir(dir, { recursive: true })
export const rmdir = (dir: string) => fs.rmdir(dir, { recursive: true })

const _slurp = async (file: string): Promise<Buffer> => {
  try {
    return fs.readFile(file)
  } catch (err) {
    console.error(`Failed to read ${file}`)
    throw err
  }
}

export const sip = _slurp
export const slurp = async (file: string) => (await _slurp(file)).toString()

export const spit = async (content: string | Buffer, file: string) => {
  try {
    await mkdir(dirname(file))
    await fs.writeFile(file, content)
  } catch (err) {
    console.error(`Failed to write ${file}`)
    throw err
  }
}

export const cp = (src: string, dest: string) => fs.copyFile(src, dest)
