import cn from "classnames"
import React from "react"

export type MenuProps = { menu_title: string }
export const HeaderMenu = ({ menu_title }: MenuProps) => (
  <button id="header-menu">
    <span></span>
    <span>{menu_title}</span>
  </button>
)
