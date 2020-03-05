import Masonry from "masonry-layout"
import { $, $$, img_loaded } from "../../domain_agnostic/browser/dom"
import { counter, sleep } from "../../domain_agnostic/isomorphic/prelude"
import { map } from "../../domain_agnostic/isomorphic/list"

const main = async () => {
  console.time("t")
  const grid = $(`.masonry`)
  const images = $$<HTMLImageElement>(`img`)
  grid?.classList.add("scripting")

  const masonry = new Masonry(grid!, {
    itemSelector: `.card`,
    gutter: `.col-gap-sizer`,
    transitionDuration: "0.5s",
    initLayout: true,
  })

  const all_loaded = Promise.all(
    map(async (image) => {
      try {
        await img_loaded(image)
      } catch (err) {
        console.error(err)
      }
      masonry.layout!()
    }, images),
  )

  const inc = counter()
  let flag = true
  ;(async () => {
    await all_loaded
    flag = false
    console.timeLog("t", "✨ - Images loaded - ✨")
  })()

  while (flag && inc() < 25) {
    await sleep(250)
    masonry.layout!()
  }
}

main()
