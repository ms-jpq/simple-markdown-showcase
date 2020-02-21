import fs from "fs"

export const slurp = (path: string) =>
  new Promise<string>((resolve, reject) =>
    fs.readFile(path, (err, data) =>
      err ? reject(err) : resolve(data.toString()),
    ),
  )
