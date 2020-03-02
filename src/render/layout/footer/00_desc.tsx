import cn from "classnames"
import React from "react"
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
