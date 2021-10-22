import Masonry from "masonry-layout"

const inc = function* () {
  let n = 0
  while (true) {
    yield n++
  }
}

const throttle = <F extends (...args: any[]) => any>(ms: number, fn: F) => {
  let s: any = undefined
  let throttling = false

  const unthrottle = () => (throttling = false)

  const throttled = (...args: Parameters<F>) => {
    if (throttling) {
      return
    }
    throttling = true
    setTimeout(unthrottle, ms)
    return fn(...args)
  }

  return (...args: Parameters<F>) => {
    clearTimeout(s)
    if (throttling) {
      s = setTimeout(throttled, ms, ...args)
    } else {
      return throttled(...args)
    }
  }
}

const main = async () => {
  const grid = document.body.querySelector(`.masonry`)
  const images = new Set(document.body.querySelectorAll(`img`))
  const header_menu = document.body.querySelector(`header > button`)

  grid?.classList.add("scripting")

  const masonry =
    grid &&
    new Masonry(grid, {
      itemSelector: `.card`,
      gutter: `.col-gap-sizer`,
      transitionDuration: "0.5s",
      initLayout: false,
    })

  header_menu?.addEventListener("click", async () => {
    await new Promise(requestAnimationFrame)
    masonry?.layout?.()
  })

  const layout = throttle(50, () => masonry?.layout?.())

  layout()

  for (const img of images) {
    img.onload = img.onerror = layout
  }

  for (const n of inc()) {
    if (!images.size || n > 40) {
      break
    } else {
      await new Promise((resolve) => setTimeout(resolve, 250))

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
}

main()
