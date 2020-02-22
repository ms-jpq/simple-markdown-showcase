import cn from "classnames"
import React from "react"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => (
  <a href="/">
    <h3>{title}</h3>
  </a>
)
