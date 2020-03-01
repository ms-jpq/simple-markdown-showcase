import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"

export type AboutMeProps = { desc: string[] }
export const AsideAboutMe = ({ desc }: AboutMeProps) => (
  <section id="about-me" className={cn("grid")}>
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </section>
)
