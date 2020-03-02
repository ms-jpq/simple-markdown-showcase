import React from "react"
import { cn } from "../../../domain_agnostic/isomorphic/dom"
import { map } from "../../../domain_agnostic/isomorphic/list"

export type NavProps = {
  off: boolean
  dest: string
  dests: { title: string; link: string }[]
}
export const AsideNav = ({ dest, off, dests }: NavProps) => (
  <section id="nav" className={cn("grid")}>
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
