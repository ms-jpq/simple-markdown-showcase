import cn from "classnames"
import React from "react"

export type TitleProps = { title: string }

export const Title = ({ title }: TitleProps) => (
  <a href="/">
    <h4 className={cn("page-title")}>{title}</h4>
  </a>
)
