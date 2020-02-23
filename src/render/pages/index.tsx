import assert from "assert"
import cn from "classnames"
import React from "react"
import { BodyProps, Page } from "../layout/layout"
import { choice } from "../../domain_agnostic/rand"
import { filter, flat_map, fst, map } from "../../domain_agnostic/list"
import { id, big_print } from "../../domain_agnostic/prelude"
import { Parent } from "../../domain_agnostic/react"
import { Render, Repo, StaticConfig } from "../../consts"
import { render_css, render_js, render_page } from "../lib"

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

const CardOverlay = ({}) => <div> </div>

// https://stackoverflow.com/questions/2941189/how-to-overlay-one-div-over-another-div
const PictureFigure = ({ images, link, children }: Picture & Parent) => (
  <div className={cn("picture")}>
    <a className={cn("content")} href={link}>
      <img src={fst(images)} />
    </a>
    <div className={cn("overlay")}>{children}</div>
  </div>
)

const TitleFigure = ({ title, link }: Title) => (
  <div className={cn("figure-title")}>
    <a href={link}>
      <h4 className={cn("title-text")}>{title}</h4>
    </a>
  </div>
)

const DetailFigure = ({ desc }: Detail) => (
  <div className={cn("detail")}>
    <p>{desc}</p>
  </div>
)

const Card = ({ images, link, title, desc, hide_detail }: CardProps) => {
  // TODO -- REMOVE THIS
  images = images || []
  assert(
    !(hide_detail && images.length === 0),
    big_print(
      `${title} - 🈲️: hide_detail with no images - hide_detail: ${hide_detail}, images: ${images.length}`,
    ),
  )
  return (
    <figure className={cn("card")}>
      {images.length ? (
        <PictureFigure images={images} link={link}>
          {[hide_detail ? <DetailFigure desc={desc} /> : <CardOverlay />]}
        </PictureFigure>
      ) : (
        undefined
      )}
      <TitleFigure title={title} link={link} />
      {hide_detail ? undefined : <DetailFigure desc={desc} />}
    </figure>
  )
}

export type RenderProps = {
  body: BodyProps
  config: StaticConfig
  repos: Repo[]
}

export const render: Render<RenderProps> = async ({ config, repos, body }) => {
  const showcase = filter((r) => r.showcase, repos)
  const title = config.title

  const [local_js, local_css] = await Promise.all([
    render_js("layout"),
    render_css("pages/index"),
  ])
  const js = [...map((s) => s.sub_path, local_js)]
  const css = [...map((s) => s.sub_path, local_css)]

  const page = (
    <Page head={{ title, js, css }} body={body}>
      {map(
        ({ title, images, html_url, desc, display }) => (
          <Card
            link={html_url}
            images={images}
            title={title}
            desc={desc}
            hide_detail={(display || {}).hide_details}
          />
        ),
        showcase,
      )}
    </Page>
  )

  return [render_page(page, ""), ...local_js, ...local_css]
}
