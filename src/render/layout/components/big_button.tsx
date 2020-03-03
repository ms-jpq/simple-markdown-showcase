import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"
import { Parent } from "../../../domain_agnostic/vender/react"

export type ButtonProps = {} & Parent
export const BigButton = ({ children }: ButtonProps) => (
  <button className={cn("big-button", "text-justify")}>{children}</button>
)
