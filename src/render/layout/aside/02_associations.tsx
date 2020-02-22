import cn from "classnames"
import React from "react"
import { ContactsConfig } from "../../../consts"
import { map } from "../../../domain_agnostic/list"

export type AssociationsProps = { contacts: ContactsConfig }

export const AsideAssociations = ({
  contacts: { email, github },
}: AssociationsProps) => (
  <section>
    <a href={`mailto:${email}`}>TODO-EMAIL-ICON</a>
    <a href={`https://github.com/${github}`}>TODO-GITHUB-ICON</a>
  </section>
)
