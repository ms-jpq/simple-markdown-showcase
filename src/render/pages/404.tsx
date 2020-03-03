import React from "react"
import { cn } from "../../domain_agnostic/isomorphic/dom"
import { RenderPage } from "../../consts"

const js = ["layout"]
const css = ["pages/404"]
const page_name = "404.html"

export type RenderProps = {}

export const render: RenderPage<RenderProps> = async ({}) => {
  const title = "404"
  const page = (
    <React.Fragment>
      <h1>404</h1>
      <h6>The page you're looking for doesn't exist</h6>
      <h4>
        <a href="/">
          <i className="fas fa-dog"></i> take me home.{" "}
          <i className="fas fa-dog"></i>
        </a>
      </h4>
    </React.Fragment>
  )
  return [{ path: "", page_name, title, js, css, page }]
}
