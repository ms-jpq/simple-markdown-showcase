import Masonry from "masonry-layout"
import { $, $$, img_loaded, wait_frame } from "nda/dist/browser/dom"
import { counter, sleep } from "nda/dist/isomorphic/prelude"
import { map } from "nda/dist/isomorphic/list"
import { throttle } from "nda/dist/isomorphic/decorator"

const grid = $(`.masonry`)
const images = $$<HTMLImageElement>(`img`)
const header_menu = $<HTMLButtonElement>(`header > button`)!

const main = async () => {
  console.time("t")
  grid?.classList.add("scripting")

  const masonry = new Masonry(grid!, {
    itemSelector: `.card`,
    gutter: `.col-gap-sizer`,
    transitionDuration: "0.5s",
    initLayout: false,
  })

  header_menu.addEventListener("click", async () => {
    await wait_frame()
    masonry.layout!()
  })

  const layout = throttle(200, () => masonry.layout!())

  const all_loaded = Promise.all(
    map(async (image) => {
      try {
        await img_loaded(image)
      } catch (err) {
        console.error(err)
      }
      layout()
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
    layout()
    await sleep(250)
  }
}

main()
