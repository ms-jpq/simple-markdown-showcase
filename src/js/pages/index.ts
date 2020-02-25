import { $, $$ } from "../../domain_agnostic/dom"
import Masonry from "masonry-layout"
import { map } from "../../domain_agnostic/list"

const main = async () => {
  const grid = $(`.grid`)
  const images = $$<HTMLImageElement>(`img`)
  const masonry = new Masonry(grid!, {
    itemSelector: `.grid-item`,
    columnWidth: 200,
    // gutter: 10,
    fitWidth: true,
    initLayout: false,
  })

  await Promise.all(
    map(
      (image) =>
        new Promise((resolve, reject) => {
          if (image.complete) {
            resolve()
          } else {
            image.onload = resolve
            image.onerror = reject
          }
        }),
      images,
    ),
  )
  ;(masonry.masonry || (() => 0))()
}

main()
