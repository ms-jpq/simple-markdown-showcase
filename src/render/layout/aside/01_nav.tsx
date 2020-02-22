import cn from "classnames"
import React from "react"
import { map } from "../../../domain_agnostic/list"

export type NavProps = { dests: { title: string; link: string }[] }
export const AsideNav = ({ dests }: NavProps) => (
  <section id="nav">
    <nav>
      <ul>
        {map(
          (d) => (
            <li>
              <a href={d.link}>{d.title}</a>
            </li>
          ),
          dests,
        )}
      </ul>
    </nav>
  </section>
)
