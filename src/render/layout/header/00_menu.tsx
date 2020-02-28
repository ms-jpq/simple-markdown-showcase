import cn from "classnames"
import React from "react"

export type MenuProps = { menu_title: string }
export const HeaderMenu = ({ menu_title }: MenuProps) => (
  <button id="header-menu" className={cn("text-capitalize", "text-justify")}>
    <i className="fas fa-bars"></i> {menu_title}
  </button>
)
