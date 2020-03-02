export const id = <T>(x: T) => x

export const str = (thing: object) => thing.toString()

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))
