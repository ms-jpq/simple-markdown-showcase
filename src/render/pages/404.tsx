import React from "react"
import { cn } from "nda/dist/isomorphic/dom"
import { RenderPage } from "../../consts"

const js = ["layout"]
const css = ["pages/404"]
const page_name = "404.html"
const desc = "404 error"

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "404"
  const page = (
    <React.Fragment>
      <h1>404</h1>
      <h3>The page you're looking for doesn't exist</h3>
      <h2>
        <a href="/">
          <i className="fas fa-dog"></i> take me home.{" "}
          <i className="fas fa-dog"></i>
        </a>
      </h2>
    </React.Fragment>
  )
  return [{ path: "", page_name, title, desc, js, css, page }]
}
