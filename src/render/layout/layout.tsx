import React from "react"
import { AsideAssociations } from "./aside/02_associations"
import { AsideConfig, FooterConfig, HeaderConfig } from "../../consts"
import { AsideNav } from "./aside/01_nav"
import { cn } from "../../domain_agnostic/isomorphic/dom"
import { FooterDesc } from "./footer/00_desc"
import { HeaderMenu } from "./header/00_menu"
import { HeaderTitle } from "./header/01_title"
import { map } from "../../domain_agnostic/isomorphic/list"
import { Parent } from "../../domain_agnostic/vender/react"
import { AsideAbout } from "./aside/00_about_me"

export type HeadProps = {
  title: string
  js: string[]
  css: string[]
}

const Head = ({ title, js, css }: HeadProps) => (
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  <header className={cn("grid")}>
    <HeaderMenu menu_title={menu} />
    <HeaderTitle title={title} />
  </header>
)

const Main = ({ children }: Parent) => (
  <main className={cn("grid", "h100")}>{children}</main>
)

export type FooterProps = {} & FooterConfig

const Footer = ({ desc }: FooterProps) => (
  <footer className={cn("grid")}>
    <FooterDesc desc={desc} />
  </footer>
)

export type AsideProps = { dest: string; off: boolean } & AsideConfig

const Aside = ({ dest, off, about_me, contacts, nav }: AsideProps) => (
  <aside id="left-panel">
    <AsideAbout desc={about_me.desc} />
    <AsideNav off={off} dests={nav} dest={dest} />
    <AsideAssociations contacts={contacts} />
  </aside>
)

export type BodyProps = {
  aside: AsideProps
  header: HeaderProps
  footer: FooterProps
}

export type PageProps = { head: HeadProps; body: BodyProps } & Parent

export const Page = ({
  head,
  body: { aside, header, footer },
  children,
}: PageProps) => (
  <html>
    <Head title={head.title} js={head.js} css={head.css} />
    <body className={cn("grid", "h100", "vw100", "mp0")}>
      <Header title={header.title} menu={header.menu} />
      <Main>{children}</Main>
      <Aside
        off={aside.off}
        dest={aside.dest}
        about_me={aside.about_me}
        nav={aside.nav}
        contacts={aside.contacts}
      />
      <Footer desc={footer.desc} />
    </body>
  </html>
)
