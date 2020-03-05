import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { Markdown } from "../layout/markdown"
import { RenderPage } from "../../consts"
import {
  AsideAssociations,
  AssociationsProps,
} from "../layout/aside/02_associations"

const js = ["layout", "pages/contact_me"]
const css = ["pages/contact_me"]
const page_name = "index.html"

export type RenderProps = { md_line: string } & AssociationsProps

export const render: RenderPage<RenderProps> = async ({
  contacts,
  md_line,
}) => {
  const title = "Contact:Me"
  const page = (
    <React.Fragment>
      <Markdown content={md_line} />
      <AsideAssociations contacts={contacts} />
    </React.Fragment>
  )
  return [{ path: "contact", page_name, title, js, css, page }]
}
