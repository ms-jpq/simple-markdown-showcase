#!/usr/bin/env ts-node
import cors from "cors"
import express from "express"
import nodemon, { Settings } from "nodemon"
//@ts-ignore
import parse from "parse-gitignore"
import { big_print } from "./src/domain_agnostic/node/prelude"
import { hostname } from "os"
import { slurp } from "./src/domain_agnostic/node/fs"
import { static_config } from "./src/consts"

const srv = (dir: string, port: number) => {
  express()
    .use(cors())
    .use(express.static(dir, {}))
    .listen(port)
  console.log(`-- Serving files at:  http://${hostname()}:${port}`)
}

const watch = (settings: Settings) =>
  nodemon(settings)
    .on("start", () => {
      console.log(big_print("STARTED", "$"))
    })
    .on("restart", (files) => {
      console.log(big_print("RESTARTED", "$"))
      console.log(files)
    })

const main = async () => {
  const git_ignore = await slurp(".gitignore")
  const ignore = parse(git_ignore)
  const execMap = {
    main: "src/entry.ts",
  }
  watch({
    ext: ["yml", "json", "ts", "tsx", "scss"].join(),
    colours: true,
    ignore,
    execMap,
  })
  srv(static_config.dist_dir, static_config.port)
}

main()
