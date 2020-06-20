#!/usr/bin/env ts-node
import { cp, isdir, readdir, rm, spit } from "nda/dist/node/fs"
import { join } from "path"
import { filter, map } from "nda/dist/isomorphic/iterator"
import { call, SpawnArgs } from "nda/dist/node/sub_process"
import { static_config } from "./src/consts"

const time = new Date().toISOString()
const diff_guarantee = join(static_config.artifacts_dir, "build_record.txt")

const chdir = () => {
  process.chdir(__dirname)
}

const run = async (args: SpawnArgs) => {
  const code = await call(args)
  if (code != 0) {
    process.exit(code)
  }
}

const git_clone = async () => {
  if (await isdir(static_config.artifacts_dir)) {
    return
  } else {
    const uri = `git@github.com:ms-jpq/ms-jpq.github.io.git`
    await run({ cmd: "git", args: ["clone", uri, static_config.artifacts_dir] })
  }
}

const git_commit = async () => {
  const msg = `CI - ${time}`
  await run({
    cmd: "git",
    args: ["add", "-A"],
    opts: { cwd: static_config.artifacts_dir },
  })
  await run({
    cmd: "git",
    args: ["commit", "-m", msg],
    opts: { cwd: static_config.artifacts_dir },
  })
  await run({
    cmd: "git",
    args: ["push", "--force"],
    opts: { cwd: static_config.artifacts_dir },
  })
}

const copy = async () => {
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
  await spit(time, diff_guarantee)
}

const main = async () => {
  chdir()
  await git_clone()
  await run({ cmd: "src/entry.ts", args: ["clean"] })
  await copy()
  await git_commit()
}

main()

