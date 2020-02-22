import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"

export type AboutMeProps = { title: string; desc: string[] }
export const AsideAboutMe = ({ title, desc }: AboutMeProps) => (
  <section>
    <h4>{title}</h4>
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </section>
)
