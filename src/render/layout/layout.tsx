import * as React from "react"

export type HeadProps = {
  title: string
  js: string[]
  css: string[]
}

const Head = ({ title, js, css }: HeadProps) => (
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    {js.map((src) => (
      <script src={src} async defer></script>
    ))}
    {css.map((href) => (
      <link href={href} rel="stylesheet"></link>
    ))}
    }
  </head>
)
