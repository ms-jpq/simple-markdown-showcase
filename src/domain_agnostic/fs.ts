import { dirname } from "path"
import { promises as fs } from "fs"

export const mkdir = (dir: string) => fs.mkdir(dir, { recursive: true })
export const rmdir = (dir: string) => fs.rmdir(dir, { recursive: true })

export const slurp = async (file: string) => {
  try {
    return (await fs.readFile(file)).toString()
  } catch (err) {
    console.error(`Failed to read ${file}`, err)
    throw err
  }
}

export const spit = async (content: string | Blob, file: string) => {
  try {
    await mkdir(dirname(file))
    await fs.writeFile(file, content)
  } catch (err) {
    console.error(`Failed to write ${file}`, err)
    throw err
  }
}
