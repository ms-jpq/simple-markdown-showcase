import React from "react"
import { RenderPage } from "../../consts"

const js = ["pages/about_me"]
const css = ["pages/about_me"]

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "About:Me"
  const page = <main></main>
  return [{ path: "about-me", title, js, css, page }]
}
