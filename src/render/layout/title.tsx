import cn from "classnames"
import React from "react"

export type TitleProps = { title: string }

export const Title = ({ title }: TitleProps) => (
  <h4 className={cn("page-title")}>
    <a href="/">{title}</a>
  </h4>
)
