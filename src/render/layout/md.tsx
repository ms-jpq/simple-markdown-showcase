import React from "react"
import markdown from "markdown-it"
import cn from "classnames"
import parser from "react-html-parser"

const md = markdown({})

export const Markdown = (content: string) => (
  <article className={cn("markdown")}>{parser(md.render(content))}</article>
)
