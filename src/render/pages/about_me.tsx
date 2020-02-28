import React from "react"
import { RenderPage } from "../../consts"

const js: string[] = []
const css: string[] = []

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "404"
  const page = <main></main>
  return [{ path: "_", title, js, css, page }]
}
