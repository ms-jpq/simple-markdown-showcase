import cn from "classnames"
import React from "react"
import { BodyProps, Page } from "../layout/layout"
import { choice } from "../../domain_agnostic/rand"
import { filter, flat_map, fst, map } from "../../domain_agnostic/list"
import { id } from "../../domain_agnostic/prelude"
import { Parent } from "../../domain_agnostic/react"
import { Render, Repo, StaticConfig } from "../../consts"
import { render_css, render_js, render_page } from "../lib"
// Use Cards with IMAGES

export type Customization = {
  hide_detail: boolean
}

export type Picture = {
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
const PictureFigure = ({ images, children }: Picture & Parent) => (
  <div className={cn("picture")}>
    <a className={cn("content")}>
      <img src={fst(images)} />
    </a>
    <div className={cn("overlay")}>{children}</div>
  </div>
)

const TitleFigure = ({ title }: Title) => (
  <div className={cn("title")}>
    <a>
      <h6>{title}</h6>
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
  const hide_detail_actual = hide_detail || images.length === 0
  return (
    <figure className={cn("card")}>
      <PictureFigure images={images}>
        {[hide_detail_actual ? <DetailFigure desc={desc} /> : <CardOverlay />]}
      </PictureFigure>
      <TitleFigure title={title} link={link} />
      {hide_detail_actual ? undefined : <DetailFigure desc={desc} />}
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
  const js = ["layout"]
  const css = ["pages/index"]
  const assets = await Promise.all([render_css(css), render_js(js)])
  const page = (
    <Page head={{ title, js, css }} body={body}>
      {map(
        ({ title, images, html_url, desc }) => (
          <Card
            link={html_url}
            images={images}
            title={title}
            desc={desc}
            hide_detail={choice([true, false])}
          />
        ),
        showcase,
      )}
    </Page>
  )

  return [render_page(page, ""), ...flat_map(id, assets)]
}
