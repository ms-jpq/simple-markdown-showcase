import React from "react"
import { RenderPage } from "../../consts"

const js = ["pages/contact_me"]
const css = ["pages/contact_me"]
const page_name = "index.html"

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "Contact:Me"
  const page = <main></main>
  return [{ path: "contact", page_name, title, js, css, page }]
}