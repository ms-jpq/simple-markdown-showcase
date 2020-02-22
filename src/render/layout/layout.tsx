import React from "react"
import { AsideAboutMe } from "./aside/00_about_me"
import { AsideAssociations } from "./aside/02_associations"
import { AsideNav } from "./aside/01_nav"
import { HeaderMenu } from "./header/00_menu"
import { HeaderTitle } from "./header/01_title"
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
    {js.map((src) => (
      <script src={src} async defer></script>
    ))}
    {css.map((href) => (
      <link href={href} rel="stylesheet"></link>
    ))}
  </head>
)

// Part of aside
export type FooterProps = { description: string[] }

const Footer = ({ description }: FooterProps) => (
  <footer>
    {description.map((d) => (
      <p>{d}</p>
    ))}
  </footer>
)

// Invisble in mobile size
export type AsideProps = { footer: FooterProps }

const Aside = ({ footer }: AsideProps) => (
  <aside>
    <AsideAboutMe />
    <AsideNav />
    <AsideAssociations />
    <Footer description={footer.description} />
  </aside>
)

// Invisible until mobile size
export type HeaderProps = {}

const Header = ({}: HeaderProps) => (
  <header>
    <HeaderMenu />
    <HeaderTitle />
  </header>
)

// Main drawing area
export type MainProps = {} & Parent

const Main = ({ children }: MainProps) => <main>{children}</main>

export type BodyProps = {
  aside: AsideProps
  header: HeaderProps
  main: MainProps
  footer: FooterProps
} & Parent

const Body = ({ aside, header, footer, main, children }: BodyProps) => (
  <body>
    <Aside footer={footer} />
    <div>
      <Header />
      <Main>{children}</Main>
    </div>
  </body>
)

export type PageProps = { head: HeadProps; body: BodyProps } & Parent

export const Page = ({ head, body, children }: PageProps) => (
  <html>
    <Head title={head.title} js={head.js} css={head.css} />
    <Body
      header={body.header}
      footer={body.footer}
      aside={body.aside}
      main={body.main}
    >
      {children}
    </Body>
  </html>
)
