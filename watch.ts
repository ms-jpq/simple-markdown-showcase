#!/usr/bin/env ts-node
import cors from "cors"
import express from "express"
import nodemon, { Settings } from "nodemon"
//@ts-ignore
import parse from "parse-gitignore"
import { big_print } from "./src/domain_agnostic/prelude"
import { hostname } from "os"
import { promises as fs } from "fs"

const srv = (dir: string, port: number) => {
  express()
    .use(cors())
    .use(express.static(dir))
    .listen(port)
  console.log(`Serving files at:  http://${hostname()}:${port}`)
}

const watch = (settings: Settings) =>
  nodemon(settings)
    .on("start", () => {
      console.log(big_print("STARTED", "$"))
    })
    .on("quit", () => {
      console.log(big_print("QUIT", "$"))
    })
    .on("restart", (files) => {
      console.log(big_print("RESTARTED", "$"))
      console.log(files)
    })

const main = async () => {
  const git_ignore = (await fs.readFile(".gitignore")).toString()
  const ignore = parse(git_ignore)
  watch({
    script: "src/entry.ts",
    ext: ["yml", "json", "ts", "tsx", "scss"].join(),
    ignore,
  })
  watch({
    exec: "tsm --nameFormat=none --listDifferent",
    ext: ["scss"].join(),
    ignore,
  })
  srv("out", 8080)
}

main()
