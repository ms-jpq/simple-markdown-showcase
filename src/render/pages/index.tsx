import assert from "assert"
import React from "react"
import { big_print } from "nda/dist/node/prelude"
import { cn } from "nda/dist/isomorphic/dom"
import { filter, fst, map, sort_by_keys } from "nda/dist/isomorphic/list"
import { RenderPage, Repo, StaticConfig } from "../../consts"
import {
  GithubLang,
  GithubStars,
  GithubForks,
} from "../layout/components/github"

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
export type Meta = {
  language: string
  colour: string
  stars: number
  forks: number
}
export type CardProps = {
  link: string
} & Picture &
  Title &
  Detail &
  Meta &
  Customization

const Card = ({
  images,
  link,
  title,
  desc,
  hide_detail,
  stars,
  language,
  forks,
  colour,
}: CardProps) => {
  assert(images !== undefined, `no images: ${title}`)
  assert(
    !(hide_detail && images.length === 0),
    big_print(
      `${title} - 🈲️: hide_detail with no images - hide_detail: ${hide_detail}, images: ${images.length}`,
    ),
  )
  const image = fst(images)
  return (
    <figure className={cn("card", "d-grid", "m-0")}>
      {image ? (
        <a href={link} className={cn("figure-img", "d-grid", "mp-0")}>
          <img
            className={cn("img-responsive", "w-100")}
            src={image}
            alt={`${title} - image`}
          />
          <div
            className={cn("figure-facade", "d-none", "ji-centre", "ai-centre")}
          >
            <i className="fas fa-chevron-right"></i>
          </div>
        </a>
      ) : (
        undefined
      )}
      <h4
        className={cn(
          "figure-title",
          "text-uppercase",
          "text-centre",
          "text-ellipsis",
          "py-2",
          "px-4",
        )}
      >
        <a href={link} className={cn("invis-link")}>
          {title}
        </a>
      </h4>
      <div
        className={cn(
          "figure-meta",
          "d-grid",
          "grid-col",
          "jc-start",
          "col-gap-4",
          "px-4",
          "pb-2",
        )}
      >
        <GithubLang lang={language} colour={colour} />
        <GithubStars stars={stars} />
        <GithubForks forks={forks} />
      </div>
      <figcaption
        className={cn(
          "figure-detail",
          "text-ellipsis",
          "text-justify",
          "px-4",
          "pb-2",
        )}
      >
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
  const sorted = sort_by_keys(
    (s) => [
      s.stargazers_count * -1,
      s.forks_count * -1,
      new Date(s.updated_at).valueOf() * -1,
    ],
    showcase,
  )
  const page = (
    <main className={cn("p-4")}>
      <div className={cn("masonry", "d-grid", "ai-end", "ji-centre")}>
        {map(
          ({
            title,
            images,
            name,
            desc,
            display,
            stargazers_count,
            forks_count,
            language,
            colour,
          }) => (
            <Card
              link={name}
              images={images}
              title={title}
              desc={desc}
              language={language}
              colour={colour}
              stars={stargazers_count}
              forks={forks_count}
              hide_detail={(display || {}).hide_details}
            />
          ),
          sorted,
        )}
        <div className="col-gap-sizer"></div>
      </div>
    </main>
  )

  return [
    {
      js,
      css,
      page_name,
      title: config.title,
      desc: config.title,
      path: "",
      page,
    },
  ]
}
