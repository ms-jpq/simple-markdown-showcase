import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"

export type MenuProps = { menu_title: string }
export const HeaderMenu = ({ menu_title }: MenuProps) => (
  <button
    id="header-menu"
    className={cn("big-button", "text-capitalize", "text-justify")}
  >
    <i className="fas fa-bars"></i> {menu_title}
  </button>
)
