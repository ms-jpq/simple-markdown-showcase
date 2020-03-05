import Masonry from "masonry-layout"
import { $, $$, img_loaded } from "../../domain_agnostic/browser/dom"
import { sleep } from "../../domain_agnostic/isomorphic/prelude"

const main = async () => {
  const grid = $(`.masonry`)
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

  for (const t of [100, 250, 500, 1000]) {
    await sleep(t)
    masonry.layout!()
  }
}

main()
