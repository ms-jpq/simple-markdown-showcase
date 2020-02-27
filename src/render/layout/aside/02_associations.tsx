import React from "react"
import { ContactsConfig } from "../../../consts"

export type AssociationsProps = { contacts: ContactsConfig }

export const AsideAssociations = ({
  contacts: { email, linkedin, github, stackoverflow },
}: AssociationsProps) => (
  <section id="associations">
    <a href={`mailto:${email}`}>
      <i className="far fa-envelope"></i>
    </a>
    <a href={`https://www.linkedin.com/in/${linkedin}`}>
      <i className="fab fa-linkedin-in"></i>
    </a>
    <a href={`https://github.com/${github}`}>
      <i className="fab fa-github"></i>
    </a>
    <a href={`https://stackexchange.com/users/${stackoverflow}`}>
      <i className="fab fa-stack-overflow"></i>
    </a>
  </section>
)
