import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => (
  <h3 className={cn("text-uppercase", "text-right")}>
    <a href="/" className={cn("invis-link")}>
      {title}
    </a>
  </h3>
)
