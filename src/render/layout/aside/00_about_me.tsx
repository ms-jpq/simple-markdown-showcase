import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"
import { Markdown } from "../markdown"

export type AboutMeProps = {
  md_line: string
}
export const AsideAbout = ({ md_line }: AboutMeProps) => (
  <section id="about-me" className={cn("d-grid")}>
    <Markdown content={md_line} />
  </section>
)
