import Masonry from "masonry-layout"
import { $, $$, img_loaded } from "../../domain_agnostic/browser/dom"

const main = async () => {
  const grid = $(`main`)
  const images = $$<HTMLImageElement>(`img`)
  grid?.classList.add("scripting")

  const masonry = new Masonry(grid!, {
    itemSelector: `.card`,
    gutter: `.col-gap-sizer`,
    transitionDuration: "0.5s",
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

main()
