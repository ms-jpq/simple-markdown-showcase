import cn from "classnames"
import hljs from "highlight.js"
import markdown from "markdown-it"
import React from "react"

const highlight = (str: string, lang: string) => {
  if (lang && hljs.getLanguage(lang)) {
    return hljs.highlight(lang, str).value
  } else {
    return ""
  }
}

const md = markdown({ highlight })

export type MarkDownProps = { content: string }

export const Markdown = ({ content }: MarkDownProps) => (
  <article
    className={cn("markdown")}
    dangerouslySetInnerHTML={{ __html: md.render(content) }}
  ></article>
)
