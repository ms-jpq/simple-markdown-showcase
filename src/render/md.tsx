import * as React from "react"
import markdown from "markdown-it"

const md = markdown({})

const Markdown = (content: string) => {
  const html = md.render(content)
  return <article>{html}</article>
}
