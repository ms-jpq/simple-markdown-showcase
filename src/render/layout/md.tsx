import cn from "classnames"
import hljs from "highlight.js"
import markdown from "markdown-it"
import parser from "react-html-parser"
import React from "react"

const highlight = (str: string, lang: string) => {
  if (lang && hljs.getLanguage(lang)) {
    const highlight = hljs.highlight(lang, str)
    return highlight.value.replace("\n", "<br>")
  } else {
    return ""
  }
}

const md = markdown({ highlight })

export type MarkDownProps = { content: string }

export const Markdown = ({ content }: MarkDownProps) => (
  <article className={cn("markdown")}>{parser(md.render(content))}</article>
)
