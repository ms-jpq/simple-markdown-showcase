import { promises as fs } from "fs"
import { dirname } from "path"

export const mkdir = (dir: string) => fs.mkdir(dir, { recursive: true })
export const rmdir = (dir: string) => fs.rmdir(dir, { recursive: true })

export const slurp = async (file: string) =>
  (await fs.readFile(file)).toString()

export const spit = async (content: string | Blob, file: string,) => {
  await mkdir(dirname(file))
  await fs.writeFile(file, content)
}
