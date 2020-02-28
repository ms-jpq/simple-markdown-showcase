import cn from "classnames"
import React from "react"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => (
  <h4 className={cn("text-uppercase", "text-right")}>
    <a href="/">{title}</a>
  </h4>
)
