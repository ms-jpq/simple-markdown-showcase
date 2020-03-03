import assert from "assert"
import React from "react"
import { big_print } from "../../domain_agnostic/node/prelude"
import { cn } from "../../domain_agnostic/isomorphic/dom"
import { filter, fst, map } from "../../domain_agnostic/isomorphic/list"
import { RenderPage, Repo, StaticConfig } from "../../consts"

export type Customization = {
  hide_detail: boolean
}

export type Picture = {
  link: string
  images: string[]
}
export type Title = {
  link: string
  title: string
}
export type Detail = {
  desc: string
}
export type CardProps = {
  link: string
} & Picture &
  Title &
  Detail &
  Customization

const Card = ({ images, link, title, desc, hide_detail }: CardProps) => {
  // TODO -- REMOVE THIS
  images = images || []
  assert(
    !(hide_detail && images.length === 0),
    big_print(
      `${title} - 🈲️: hide_detail with no images - hide_detail: ${hide_detail}, images: ${images.length}`,
    ),
  )
  const image = fst(images)
  return (
    <figure className={cn("card", "grid", "overflow-hide-x")}>
      {image ? (
        <a href={link} className={cn("figure-img", "mp0")}>
          <img className={cn("img-responsive")} src={image} />
        </a>
      ) : (
        <span className={cn("figure-img")}></span>
      )}
      <h6
        className={cn(
          "figure-title",
          "text-uppercase",
          "text-centre",
          "text-ellipsis",
        )}
      >
        <a href={link} className={cn("invis-link")}>
          {title}
        </a>
      </h6>
      <figcaption className={cn("figure-detail", "text-ellipsis")}>
        {desc}
      </figcaption>
    </figure>
  )
}

export type RenderProps = {
  config: StaticConfig
  repos: Repo[]
}

const js = ["layout", "pages/index"]
const css = ["pages/index"]
const page_name = "index.html"

export const render: RenderPage<RenderProps> = async ({ config, repos }) => {
  const showcase = filter((r) => r.showcase, repos)

  const page = (
    <React.Fragment>
      {map(
        ({ title, images, name, desc, display }) => (
          <Card
            link={name}
            images={images}
            title={title}
            desc={desc}
            hide_detail={(display || {}).hide_details}
          />
        ),
        showcase,
      )}
      <div className={cn("card-sizer")}></div>
      <div className={cn("card-gutter-sizer")}></div>
    </React.Fragment>
  )

  return [{ js, css, page_name, title: config.title, path: "", page }]
}
