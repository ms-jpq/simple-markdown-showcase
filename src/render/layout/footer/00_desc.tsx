import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"
import { map } from "../../../domain_agnostic/isomorphic/list"

export type DescProps = { desc: string[] }
export const FooterDesc = ({ desc }: DescProps) => (
  <React.Fragment>
    {map(
      (d) => (
        <p className={cn("text-centre")}>{d}</p>
      ),
      desc,
    )}
  </React.Fragment>
)
