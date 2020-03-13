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
const desc = "contact me"

export type RenderProps = { md_line: string } & AssociationsProps

export const render: RenderPage<RenderProps> = async ({
  contacts,
  md_line,
}) => {
  const title = "Contact:Me"
  const page = (
    <main className={cn("d-grid")}>
      <Markdown content={md_line} />
      <AsideAssociations contacts={contacts} />
    </main>
  )
  return [{ path: "contact", page_name, title, desc, js, css, page }]
}
