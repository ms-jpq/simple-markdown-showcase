import Masonry from "masonry-layout"
import { $, $$, img_loaded } from "../../domain_agnostic/browser/dom"
import { sleep } from "../../domain_agnostic/isomorphic/prelude"

const main = async () => {
  const grid = $(`main`)
  const images = $$<HTMLImageElement>(`img`)
  grid?.classList.add("scripting")

  const masonry = new Masonry(grid!, {
    itemSelector: `.card`,
    columnWidth: `.card-sizer`,
    gutter: `.card-gutter-sizer`,
    fitWidth: true,
    transitionDuration: "0.6s",
    initLayout: true,
  })

  for (const image of images) {
    ;(async () => {
      try {
        await img_loaded(image)
      } catch (err) {
        console.error(err)
      }
      masonry.layout!()
    })()
  }
}

// main()
