#!/usr/bin/env ts-node
import ignore from "ignore"
import { ChildProcess, spawn } from "child_process"
import { promises as fs } from "fs"
import { relative } from "path"
import { watchTree } from "watch"

const run = (program: string, ...args: string[]) => {
  const { stdin, stdout, stderr } = process
  let child: ChildProcess | undefined = undefined
  return async () => {
    if (child) {
      const dead = new Promise((resolve) => child!.once("exit", resolve))
      child.kill()
      await dead
      console.warn(`
      ==================
      killed sub_process
      ==================
      `)
    }
    child = spawn(program, args, {
      stdio: [stdin, stdout, stderr],
    })
  }
}

const thunk = (fn: () => void, ms: number) => {
  let timer: any = undefined
  return () => {
    clearTimeout(timer)
    timer = setTimeout(fn, ms)
  }
}

const watch = async (run: () => void, timeout: number) => {
  const git_ignore = (await fs.readFile(".gitignore")).toString()
  const ig = ignore().add(git_ignore)
  const filter = (file: string) => ig.ignores(relative(__dirname, file))
  watchTree(__dirname, { filter }, thunk(run, timeout))
}

watch(run("src/entry.ts"), 100)
