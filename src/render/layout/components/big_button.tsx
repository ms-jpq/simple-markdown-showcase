import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { Parent } from "../../../vender/react"

export type ButtonProps = {} & Parent
export const BigButton = ({ children }: ButtonProps) => (
  <button className={cn("big-button", "text-justify")}>{children}</button>
)
