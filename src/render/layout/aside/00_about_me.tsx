import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { Markdown } from "../markdown"

export type AboutMeProps = {
  md_line: string
}
export const AsideAbout = ({ md_line }: AboutMeProps) => (
  <section id="about-me">
    <Markdown content={md_line} />
  </section>
)
