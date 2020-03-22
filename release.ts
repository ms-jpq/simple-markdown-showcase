#!/usr/bin/env ts-node
import { cp, readdir, rm } from "nda/dist/node/fs"
import { filter, map } from "nda/dist/isomorphic/iterator"
import { run } from "nda/dist/node/sub_process"
import { static_config } from "./src/consts"

const main = async () => {
  const { stdout, stderr } = await run("./src/entry.ts", "clean")
  console.error(stderr)
  console.log(stdout)
  const prev = await readdir(1, static_config.artifacts_dir)
  const prev__artifacts = filter((n) => !n.endsWith(".git"), [
    ...prev.dirs,
    ...prev.files,
  ])
  await Promise.all(map(rm, prev__artifacts))
  await Promise.all([
    cp(static_config.templates_dir, static_config.artifacts_dir),
    cp(static_config.dist_dir, static_config.artifacts_dir),
  ])

  const { stdout: gout, stderr: gerr } = await run("./git.sh")
  console.error(gerr)
  console.log(gout)
}

main()
