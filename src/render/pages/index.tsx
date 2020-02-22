// Use Cards with IMAGES
import React from "react"
import cn from "classnames"
import { Parent } from "../../domain_agnostic/react"
import { Render, additional_pages } from "../../consts"

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
      <img src={images[0]} />
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

const Card = ({ images, link, title, desc, hide_detail }: CardProps) => (
  <figure className={cn("card")}>
    <PictureFigure images={images}>
      {[hide_detail ? <DetailFigure desc={desc} /> : <CardOverlay />]}
    </PictureFigure>
    <TitleFigure title={title} link={link} />
    {hide_detail ? undefined : <DetailFigure desc={desc} />}
  </figure>
)

export const render: Render<{}> = (spec) => []
