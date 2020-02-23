import assert from "assert"
import cn from "classnames"
import React from "react"
import { BodyProps, Page } from "../layout/layout"
import { filter, flat_map, fst, map } from "../../domain_agnostic/list"
import { id, big_print } from "../../domain_agnostic/prelude"
import { Parent } from "../../domain_agnostic/react"
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

const local_js = ["js/layout"]
const local_css = ["css/pages/index"]
const npm_js = ["node_modules/masonry-layout/dist/masonry.pkgd"]
const npm_css = [] as string[]
const js = [...npm_js, ...local_js]
const css = [...npm_css, ...local_css]

export const render: RenderPage<RenderProps> = async ({
  config,
  repos,
  body,
}) => {
  const showcase = filter((r) => r.showcase, repos)
  const title = config.title
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

  const pages = [{ path: "", page }]
  return [{ local_js, local_css, npm_js, npm_css, pages }]
}
