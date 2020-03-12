import React from "react"
import { AsideAssociations } from "./aside/02_associations"
import { AsideConfig, HeaderConfig } from "../../consts"
import { AsideNav } from "./aside/01_nav"
import { cn } from "nda/dist/isomorphic/dom"
import { FooterDesc } from "./footer/00_desc"
import { HeaderMenu } from "./header/00_menu"
import { HeaderTitle } from "./header/01_title"
import { map } from "nda/dist/isomorphic/list"
import { Parent } from "../../vender/react"
import { AsideAbout } from "./aside/00_about_me"

export type HeadProps = {
  title: string
  desc: string
  js: string[]
  css: string[]
}

const Head = ({ title, desc, js, css }: HeadProps) => (
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={desc} />
    <title>{title}</title>
    {map(
      (src) => (
        <script src={src} defer></script>
      ),
      js,
    )}
    {map(
      (href) => (
        <link href={href} rel="stylesheet"></link>
      ),
      css,
    )}
  </head>
)

export type HeaderProps = {} & HeaderConfig

const Header = ({ title, menu }: HeaderProps) => (
  <header className={cn("d-grid", "grid-col")}>
    <HeaderMenu menu_title={menu} />
    <HeaderTitle title={title} />
  </header>
)

const Main = ({ children }: Parent) => (
  <main className={cn("d-grid")}>{children}</main>
)

export type FooterProps = { md_line: string }

const Footer = ({ md_line }: FooterProps) => (
  <footer className={cn("d-grid", "ji-centre", "ai-centre")}>
    <FooterDesc md_line={md_line} />
  </footer>
)

export type AsideProps = {
  md_line: string
  dest: string
  off: boolean
} & AsideConfig

const Aside = ({ dest, off, md_line, contacts, nav }: AsideProps) => (
  <aside id="left-panel" className={cn("grid", "ac-start")}>
    <AsideAbout md_line={md_line} />
    <AsideNav off={off} dests={nav} dest={dest} />
    <AsideAssociations contacts={contacts} />
  </aside>
)

export type BodyProps = {
  aside: AsideProps
  header: HeaderProps
  footer: FooterProps
}

export type PageProps = {
  lang: string
  head: HeadProps
  body: BodyProps
} & Parent

export const Page = ({
  lang,
  head,
  body: { aside, header, footer },
  children,
}: PageProps) => (
  <html lang={lang}>
    <Head title={head.title} desc={head.desc} js={head.js} css={head.css} />
    <body className={cn("d-grid", "vw-100", "mp-0")}>
      <Header title={header.title} menu={header.menu} />
      <Main>{children}</Main>
      <Aside
        off={aside.off}
        dest={aside.dest}
        md_line={aside.md_line}
        nav={aside.nav}
        contacts={aside.contacts}
      />
      <Footer md_line={footer.md_line} />
    </body>
  </html>
)
