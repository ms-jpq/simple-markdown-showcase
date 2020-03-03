import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"
import { map } from "../../../domain_agnostic/isomorphic/list"

export type AboutMeProps = {
  desc: string[]
}
export const AsideAbout = ({ desc }: AboutMeProps) => (
  <section id="about-me" className={cn("grid")}>
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </section>
)
