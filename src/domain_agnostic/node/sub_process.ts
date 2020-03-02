import { execFile } from "child_process"

export const run = async (cmd: string, ...args: string[]) => {
  const { stdout, stderr } = await new Promise<{
    stdout: string
    stderr: string
  }>((resolve, reject) =>
    execFile(cmd, args, (err, stdout, stderr) =>
      err ? reject(err) : resolve({ stdout, stderr }),
    ),
  )
  console.log(stdout)
  console.error(stderr)
}
