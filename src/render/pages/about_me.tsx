import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { RenderPage } from "../../consts"
import { Markdown } from "../layout/markdown"

const js = ["layout"]
const css = ["pages/about_me"]
const page_name = "index.html"
const desc = "about me"

export type RenderProps = { md_line: string }

export const render: RenderPage<RenderProps> = async ({ md_line }) => {
  const title = "About:Me"
  const page = (
    <main className={cn("d-grid")}>
      <Markdown content={md_line} />
    </main>
  )
  return [{ path: "about-me", page_name, title, desc, js, css, page }]
}
