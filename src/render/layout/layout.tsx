import cn from "classnames"
import React from "react"
import { AsideAboutMe } from "./aside/00_about_me"
import { AsideAssociations } from "./aside/02_associations"
import { AsideConfig, FooterConfig, HeaderConfig } from "../../consts"
import { AsideNav } from "./aside/01_nav"
import { FooterDesc } from "./footer/00_desc"
import { HeaderMenu } from "./header/00_menu"
import { HeaderTitle } from "./header/01_title"
import { map } from "../../domain_agnostic/list"
import { Parent } from "../../domain_agnostic/react"

export type HeadProps = {
  title: string
  entry: string
}

const Head = ({ title, entry }: HeadProps) => (
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <script src={entry} defer></script>
  </head>
)

// Part of aside
export type FooterProps = {} & FooterConfig

const Footer = ({ desc }: FooterProps) => (
  <footer>
    <FooterDesc desc={desc} />
  </footer>
)

// Invisble in mobile size
export type AsideProps = {} & AsideConfig

// Children is only <Footer />
const Aside = ({
  about_me,
  contacts,
  nav,
  footer,
}: AsideProps & { footer: FooterProps }) => (
  <aside id="left-panel">
    <AsideAboutMe title={about_me.title} desc={about_me.desc} />
    <AsideNav dests={nav} />
    <AsideAssociations contacts={contacts} />
    <Footer desc={footer.desc} />
  </aside>
)

// Invisible until mobile size
export type HeaderProps = {} & HeaderConfig

const Header = ({ title, menu }: HeaderProps) => (
  <header>
    <HeaderMenu menu_title={menu} />
    <HeaderTitle title={title} />
  </header>
)

// Main drawing area
const Main = ({ children }: Parent) => <main>{children}</main>

export type BodyProps = {
  aside: AsideProps
  header: HeaderProps
  footer: FooterProps
}

const Body = ({ aside, header, footer, children }: BodyProps & Parent) => (
  <body>
    <Aside
      about_me={aside.about_me}
      nav={aside.nav}
      contacts={aside.contacts}
      footer={footer}
    />
    <div id="right-panel">
      <Header title={header.title} menu={header.menu} />
      <Main>{children}</Main>
    </div>
  </body>
)

export type PageProps = { head: HeadProps; body: BodyProps } & Parent

export const Page = ({ head, body, children }: PageProps) => (
  <html>
    <Head title={head.title} entry={head.entry} />
    <Body header={body.header} footer={body.footer} aside={body.aside}>
      {children}
    </Body>
  </html>
)
