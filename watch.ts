#!/usr/bin/env ts-node
import { ChildProcess, spawn } from "child_process"
import { watchTree } from "watch"

const run = (program: string, ...args: string[]) => {
  const { stdin, stdout, stderr } = process
  const msg = `
  ==================
  killed sub_process
  ==================
  `
  let child: ChildProcess | undefined = undefined
  return async () => {
    if (child) {
      const dead = new Promise((resolve) => child!.on("exit", resolve))
      child.kill()
      await dead
      console.warn(msg)
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

const watch = (run: () => void, timeout: number) => {
  const ignoreDirectoryPattern = /node_modules|out|temp/g
  watchTree(__dirname, { ignoreDirectoryPattern }, thunk(run, timeout))
}

watch(run("src/entry.ts"), 100)
