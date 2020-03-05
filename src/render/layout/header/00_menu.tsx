import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { BigButton } from "../components/big_button"

export type MenuProps = { menu_title: string }
export const HeaderMenu = ({ menu_title }: MenuProps) => (
  <BigButton>
    <i className="fas fa-bars"></i> {menu_title}
  </BigButton>
)
