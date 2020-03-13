import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { ContactsConfig } from "../../../consts"

export type CircleProps = { href: string; class_name: string }

const Circle = ({ href, class_name }: CircleProps) => (
  <a
    className={cn(
      "association-circle",
      "border-solid",
      "border-thin",
      "border-circle",
      "d-grid",
      "ai-centre",
      "ji-centre",
    )}
    href={href}
  >
    <i className={class_name}></i>
  </a>
)

export type AssociationsProps = { contacts: ContactsConfig }

export const AsideAssociations = ({
  contacts: { email, linkedin, github, dockerhub, stackoverflow },
}: AssociationsProps) => (
  <section
    id="associations"
    className={cn("associations", "d-grid", "grid-col", "text-centre")}
  >
    <Circle href={`mailto:${email}`} class_name={"far fa-envelope"} />
    <Circle
      href={`https://www.linkedin.com/in/${linkedin}`}
      class_name={"fab fa-linkedin-in"}
    />
    <Circle
      href={`https://github.com/${github}`}
      class_name={"fab fa-github"}
    />
    <Circle
      href={`https://stackexchange.com/users/${stackoverflow}`}
      class_name={"fab fa-stack-overflow"}
    />
  </section>
)
