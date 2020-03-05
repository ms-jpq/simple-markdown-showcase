import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { Markdown } from "../markdown"

export type DescProps = { md_line: string }
export const FooterDesc = ({ md_line }: DescProps) => (
  <Markdown content={md_line} />
)
