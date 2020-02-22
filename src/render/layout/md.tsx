import cn from "classnames"
import markdown from "markdown-it"
import parser from "react-html-parser"
import React from "react"

const md = markdown({})

export type MarkDownProps = { content: string }

export const Markdown = ({ content }: MarkDownProps) => (
  <article className={cn("markdown")}>{parser(md.render(content))}</article>
)
