import React from "react"
import { cn } from "../../domain_agnostic/isomorphic/dom"
import { RenderPage } from "../../consts"
import {
  AsideAssociations,
  AssociationsProps,
} from "../layout/aside/01_associations"

const js = ["pages/contact_me"]
const css = ["pages/contact_me"]
const page_name = "index.html"

export type RenderProps = {} & AssociationsProps

export const render: RenderPage<RenderProps> = async ({ contacts }) => {
  const title = "Contact:Me"
  const page = (
    <React.Fragment>
      <AsideAssociations contacts={contacts} />
    </React.Fragment>
  )
  return [{ path: "contact", page_name, title, js, css, page }]
}
