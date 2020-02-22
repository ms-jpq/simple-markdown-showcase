import cn from "classnames"
import React from "react"
import { Title } from "../title"

export type TitleProps = { title: string }

export const HeaderTitle = ({ title }: TitleProps) => <Title title={title} />
