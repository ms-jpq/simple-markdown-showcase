import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"

export type NavProps = {
  off: boolean
  dest: string
  dests: { title: string; link: string }[]
}
export const AsideNav = ({ dest, off, dests }: NavProps) => (
  <section id="nav" className={cn("flex-col")}>
    <nav>
      <ul>
        {map(
          (d) => (
            <li
              className={cn("text-capitalize", {
                active: !off && d.link === dest,
              })}
            >
              <a href={`/${d.link}`}>{d.title}</a>
            </li>
          ),
          dests,
        )}
      </ul>
    </nav>
  </section>
)
