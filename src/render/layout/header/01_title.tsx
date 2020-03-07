import React from "react"
import { cn } from "nda/dist/isomorphic/dom"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => (
  <h2 id="header-title" className={cn("text-uppercase", "text-ellipsis")}>
    <a href="/" className={cn("invis-link")}>
      {title}
    </a>
  </h2>
)
