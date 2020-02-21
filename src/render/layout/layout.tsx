import * as React from "react"

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
    }
  </head>
)

export type HeaderProps = {}

const Header = ({}: HeaderProps) => <header></header>

export type FooterProps = {}

const Footer = ({}: FooterProps) => <footer> </footer>

export type AsideProps = {}

const Aside = ({}: AsideProps) => (
  <aside>
    <section></section>
    <section></section>
  </aside>
)

export type MainProps = {}

const Main = ({}: MainProps) => <main> </main>

export type BodyProps = {}

const Body = ({}: BodyProps) => (
  <body>
    <Header />
    <Aside />
    <div>
      <Main />
      <Footer />
    </div>
  </body>
)
