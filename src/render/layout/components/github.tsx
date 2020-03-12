import React from "react"
import { cn } from "nda/dist/isomorphic/dom"

export type LangProps = { lang: string; colour: string }

export const GithubLang = ({ lang, colour }: LangProps) => (
  <span className={cn("github-lang")}>
    <i
      className={cn("border-circle", "d-ib")}
      style={{ backgroundColor: colour }}
    ></i>{" "}
    {lang}
  </span>
)

export type StarProps = { stars: number }

export const GithubStars = ({ stars }: StarProps) => (
  <span className={cn("github-stars", { hidden: stars === 0 })}>
    <i className="fas fa-star"></i> {stars}
  </span>
)

export type ForkProps = { forks: number }

export const GithubForks = ({ forks }: ForkProps) => (
  <span className={cn("github-forks", { hidden: forks === 0 })}>
    <i className="fas fa-code-branch"></i> {forks}
  </span>
)
