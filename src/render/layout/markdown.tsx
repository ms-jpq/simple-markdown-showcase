import hljs from "highlight.js"
import markdown from "markdown-it"
import React from "react"
import { cn } from "../../domain_agnostic/isomorphic/dom"

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
  <div
    className={cn("markdown")}
    dangerouslySetInnerHTML={{ __html: md.render(content) }}
  ></div>
)
