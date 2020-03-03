import img_loaded from "imagesloaded"
import Masonry from "masonry-layout"
import { $, $$ } from "../../domain_agnostic/browser/dom"
import { map } from "../../domain_agnostic/isomorphic/list"
import "../layout"

const main = async () => {
  const grid = $(`main`)
  const images = $$<HTMLImageElement>(`img`)
  const masonry = new Masonry(grid!, {
    itemSelector: `.card`,
    transitionDuration: "0.6s",
    initLayout: false,
  })
  for (const image of images) {
    ;(async () => {
      await new Promise((resolve) => img_loaded(image, resolve))
      masonry.layout!()
    })()
  }
}

// main()
