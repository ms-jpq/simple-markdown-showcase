import React from "react"
import { renderToString } from "react-dom/server"
import {} from "../layout/layout"
import { Render, Repo } from "../../consts"

export type RepoProps = { title: string } & Repo

const Repo = (props: RepoProps) => <div> </div>

const render_repo = () => {}

export const render: Render<Repo> = (spec) => []
