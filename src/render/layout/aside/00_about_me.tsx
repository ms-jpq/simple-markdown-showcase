import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"

export type AboutMeProps = { title: string; desc: string[] }
export const AsideAboutMe = ({ title, desc }: AboutMeProps) => (
  <section id="about-me" className={cn("flex-col")}>
    <h6 className={cn("text-uppercase")}>
      <a href="/">{title}</a>
    </h6>
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </section>
)
