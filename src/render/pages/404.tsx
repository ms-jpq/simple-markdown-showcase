import React from "react"
import { RenderPage } from "../../consts"

const js = ["pages/404"]
const css = ["pages/404"]

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "404"
  const page = <main></main>
  return [{ path: "404", title, js, css, page }]
}
