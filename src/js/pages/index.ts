import Masonry from "masonry-layout"
import { $, $$, wait_frame } from "nda/dist/browser/dom"
import { counter, sleep } from "nda/dist/isomorphic/prelude"
import { filter, iter } from "nda/dist/isomorphic/list"
import { throttle } from "nda/dist/isomorphic/decorator"

const grid = $(`.masonry`)
const images = new Set($$<HTMLImageElement>(`img`))
const header_menu = $<HTMLButtonElement>(`header > button`)!

const main = async () => {
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

  const layout = throttle(50, () => masonry.layout!())

  layout()

  for (const img of images) {
    img.onload = img.onerror = layout
  }

  const inc = counter()

  while (images.size && inc() < 40) {
    await sleep(250)
    const old_size = images.size

    for (const img of images) {
      if (img.naturalWidth !== 0 && img.naturalHeight !== 0) {
        images.delete(img)
      }
    }

    if (images.size !== old_size) {
      layout()
    }
  }
}

main()
