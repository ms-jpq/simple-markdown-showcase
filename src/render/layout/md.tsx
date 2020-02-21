import * as React from "react"
import markdown from "markdown-it"
import parser from "react-html-parser"

const md = markdown({})

export const Markdown = (content: string) => (
  <article className={"markdown"}>{parser(md.render(content))}</article>
)
