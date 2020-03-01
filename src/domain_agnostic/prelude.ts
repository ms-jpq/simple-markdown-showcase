export const set_defaults = () => {
  process.once("unhandledRejection", async (reason, prom) => {
    const p = await prom
    console.log(reason)
    console.log(p)
    process.exit(255)
  })
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

export const id = <T>(x: T) => x

export const str = (thing: object) => thing.toString()

export const big_print = (str: string, top = " ", btm = " ") => {
  const { columns } = process.stdout
  return `
  ${top.repeat(columns - 2)}
  ${str}
  ${btm.repeat(columns - 2)}
  `
}
