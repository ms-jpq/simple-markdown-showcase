import { join } from "../isomorphic/list"
import { ReactNode } from "react"

export type Parent = {
  children: ReactNode | ReactNode[]
}

export const classes = (...classes: (string | Record<string, boolean>)[]) => {
  const classlist = []

  for (const c of classes) {
    if (typeof c === "string") {
      classlist.push(c)
    } else {
      for (const [k, v] of Object.entries(c)) {
        if (v) {
          classlist.push(k)
        }
      }
    }
  }

  return join(" ", classlist)
}
