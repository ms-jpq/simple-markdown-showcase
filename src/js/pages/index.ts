import img_loaded from "imagesloaded"
import Masonry from "masonry-layout"
import { $, $$ } from "../../domain_agnostic/dom"
import { map } from "../../domain_agnostic/list"
import "../layout"

const main = async () => {
  const grid = $(`main`)
  const images = $$<HTMLImageElement>(`img`)
  const masonry = new Masonry(grid!, {
    itemSelector: `.card`,
    percentPosition: true,
    transitionDuration: "0.6s",
  })
  for (const image of images) {
    ;(async () => {
      await new Promise((resolve) => img_loaded(image, resolve))
      image.classList.remove("hidden")
      masonry.layout!()
    })()
  }
}

main()
