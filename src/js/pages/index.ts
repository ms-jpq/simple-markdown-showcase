import Masonry from "masonry-layout"
import { $, $$, wait_frame } from "nda/dist/browser/dom"
import { counter, sleep } from "nda/dist/isomorphic/prelude"
import { filter, iter } from "nda/dist/isomorphic/list"
import { throttle } from "nda/dist/isomorphic/decorator"

const grid = $(`.masonry`)
const images = $$<HTMLImageElement>(`img`)
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

  iter((img) => (img.onload = img.onerror = layout), images)

  const inc = counter()
  const set = new Set()

  while (inc() < 100) {
    await sleep(250)

    const mature = filter(
      (img) => img.naturalWidth !== 0 && img.naturalHeight !== 0,
      images,
    )

    const old_size = set.size
    iter((img) => set.add(img), mature)
    if (set.size !== old_size) {
      layout()
    }

    if (set.size === images.length) {
      break
    }
  }
}

main()
