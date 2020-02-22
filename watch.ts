#!/usr/bin/env ts-node
import cors from "cors"
import express from "express"
import nodemon from "nodemon"
import { hostname } from "os"

const srv = (dir: string, port: number) => {
  express()
    .use(cors())
    .use(express.static(dir))
    .listen(port)
  console.log(`Serving files at:  http://${hostname()}:${port}`)
}

nodemon({
  script: "src/entry.ts",
  ext: ["yml", "json", "ts", "css"].join(),
  ignore: ["temp/*", "out/*"],
})
  .on("start", () => {
    console.log("App has started")
  })
  .on("quit", () => {
    console.log("App has quit")
  })
  .on("restart", (files) => {
    console.log("App restarted due to: ", files)
  })

srv("out", 8080)
