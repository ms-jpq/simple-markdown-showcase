import React from "react"
import { RenderPage } from "../../consts"

const js = ["pages/404"]
const css = ["pages/404"]
const page_name = "404.html"

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "404"
  const page = <main></main>
  return [{ path: "", page_name, title, js, css, page }]
}
