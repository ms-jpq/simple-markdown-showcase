import React from "react"
import { cn } from "../../domain_agnostic/isomorphic/dom"
import { RenderPage } from "../../consts"
import { Markdown } from "../layout/md"

const js = ["layout"]
const css = ["pages/about_me"]
const page_name = "index.html"

export type RenderProps = { md_line: string }

export const render: RenderPage<RenderProps> = async ({ md_line }) => {
  const title = "About:Me"
  const page = (
    <React.Fragment>
      <Markdown content={md_line} />
    </React.Fragment>
  )
  return [{ path: "about-me", page_name, title, js, css, page }]
}
