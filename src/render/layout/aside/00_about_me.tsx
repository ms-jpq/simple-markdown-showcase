import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"
import { Title } from "../title"

export type AboutMeProps = { title: string; desc: string[] }
export const AsideAboutMe = ({ title, desc }: AboutMeProps) => (
  <section id="about-me">
    <Title title={title} />
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </section>
)
