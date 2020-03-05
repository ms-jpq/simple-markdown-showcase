import React from "react"
import { cn } from "nda/dist/isomorphic/dom"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => (
  <h2 className={cn("text-uppercase", "text-right", "text-ellipsis")}>
    <a href="/" className={cn("invis-link")}>
      {title}
    </a>
  </h2>
)
