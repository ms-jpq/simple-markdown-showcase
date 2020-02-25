import React from "react"
import { ContactsConfig } from "../../../consts"

export type AssociationsProps = { contacts: ContactsConfig }

export const AsideAssociations = ({
  contacts: { email, github },
}: AssociationsProps) => (
  <section id="associations">
    <a href={`mailto:${email}`}>
      <i className="fas fa-at"></i>
    </a>
    <a href={`https://github.com/${github}`}>
      <i className="fab fa-github"></i>
    </a>
  </section>
)
