import { readFile, writeFile } from "fs"

export const slurp = (path: string) =>
  new Promise<string>((resolve, reject) =>
    readFile(path, (err, data) =>
      err ? reject(err) : resolve(data.toString()),
    ),
  )

export const spit = (data: string | Buffer, path: string) =>
  new Promise<void>((resolve, reject) =>
    writeFile(path, data, (err) => (err ? reject(err) : resolve())),
  )
