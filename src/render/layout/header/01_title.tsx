import cn from "classnames"
import React from "react"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => (
  <h6 className={cn("text-uppercase", "text-right")}>
    <a href="/" className={cn("invis-link")}>
      {title}
    </a>
  </h6>
)
