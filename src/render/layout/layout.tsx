import React from "react"
import { AsideAboutMe } from "./aside/00_about_me"
import { AsideAssociations } from "./aside/02_associations"
import { AsideNav } from "./aside/01_nav"
import { ContactsConfig } from "../../consts"
import { HeaderMenu } from "./header/00_menu"
import { HeaderTitle, TitleProps } from "./header/01_title"
import { map } from "../../domain_agnostic/list"
import { Parent } from "../../domain_agnostic/react"

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
        <script src={src} async defer></script>
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

// Part of aside
export type FooterProps = { desc: string[] }

const Footer = ({ desc }: FooterProps) => (
  <footer>
    {map(
      (d) => (
        <p>{d}</p>
      ),
      desc,
    )}
  </footer>
)

// Invisble in mobile size
export type AsideProps = { contacts: ContactsConfig }

// Children is only <Footer />
const Aside = ({ contacts, children }: AsideProps & Parent) => (
  <aside>
    <AsideAboutMe />
    <AsideNav />
    <AsideAssociations contacts={contacts} />
    {children}
  </aside>
)

// Invisible until mobile size
export type HeaderProps = {} & TitleProps

const Header = ({ title }: HeaderProps) => (
  <header>
    <HeaderMenu />
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
    <Aside contacts={aside.contacts}>{[<Footer desc={footer.desc} />]}</Aside>
    <div>
      <Header title={header.title} />
      <Main>{children}</Main>
    </div>
  </body>
)

export type PageProps = { head: HeadProps; body: BodyProps } & Parent

export const Page = ({ head, body, children }: PageProps) => (
  <html>
    <Head title={head.title} js={head.js} css={head.css} />
    <Body header={body.header} footer={body.footer} aside={body.aside}>
      {children}
    </Body>
  </html>
)
