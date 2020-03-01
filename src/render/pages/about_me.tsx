import React from "react"
import { RenderPage } from "../../consts"

const js = ["pages/about_me"]
const css = ["pages/about_me"]
const page_name = "index.html"

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "About:Me"
  const page = (
    <React.Fragment>
      <h1>h1</h1>
      <h2>h2</h2>
      <h3>h3</h3>
      <h4>h4</h4>
      <h5>h5</h5>
      <h6>h6</h6>
      <p>p</p>
    </React.Fragment>
  )
  return [{ path: "about-me", page_name, title, js, css, page }]
}
