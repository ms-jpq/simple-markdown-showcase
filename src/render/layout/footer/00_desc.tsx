import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"

export type DescProps = { desc: string[] }
export const FooterDesc = ({ desc }: DescProps) => (
  <div>
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </div>
)
