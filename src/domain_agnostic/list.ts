export const fst = <T>(elems: T[]) => (elems.length > 0 ? elems[0] : undefined)

export const snd = <T>(elems: T[]) => (elems.length > 1 ? elems[1] : undefined)

export const range = (begin: number, end: number, step = 1) => {
  const nums = []
  let nxt = begin
  while (nxt <= end) {
    nums.push(nxt)
    nxt = nxt + step
  }
  return nums
}

export const enumerate = <T>(elems: T[]): [number, T][] =>
  elems.map((e, i) => [i, e])

export const map = <T, U>(trans: (_: T) => U, elems: T[]) => elems.map(trans)

export const flat_map = <T, U>(trans: (_: T) => U[], elems: T[]) =>
  elems.flatMap(trans)

export const compact_map = <T, U>(
  trans: (_: T) => U | undefined,
  elems: T[],
) => {
  const next = []
  for (const elem of elems) {
    const nxt = trans(elem)
    if (nxt !== undefined) {
      next.push(nxt)
    }
  }
  return next
}

export const filter = <T>(predicate: (_: T) => boolean, elems: T[]) =>
  elems.filter(predicate)

export const reduce = <T, U>(trans: (_: U, __: T) => U, init: U, elems: T[]) =>
  elems.reduce(trans, init)

export const find_by = <T>(predicate: (_: T) => boolean, elems: T[]) =>
  elems.find(predicate)

export const sort_by = <T>(key_by: (_: T) => number, elems: T[]) => {
  const sort = (a: T, b: T) => key_by(a) - key_by(b)
  return [...elems].sort(sort)
}

export const unique_by = <T>(key_by: (_: T) => any, elems: T[]) => {
  const set = new Set()
  const unique: T[] = []
  for (const elem of elems) {
    const key = key_by(elem)
    if (!set.has(key)) {
      unique.push(elem)
    }
    set.add(key)
  }
  return unique
}

export const any = <T>(predicate: (_: T) => boolean, elems: T[]) =>
  elems.some(predicate)

export const all = <T>(predicate: (_: T) => boolean, elems: T[]) =>
  elems.every(predicate)

export const take = <T>(n: number, elems: T[]) => elems.filter((_, i) => i < n)

export const join = <T>(sep: string, elems: T[]) => elems.join(sep)

export const generate = <T>(generator: () => T, n: number) => {
  const lst = []
  for (const _ of range(1, n)) {
    lst.push(generator())
  }
  return lst
}
