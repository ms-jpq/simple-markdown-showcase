import Masonry from "masonry-layout"

const inc = function* () {
  let n = 0
  while (true) {
    yield n++
  }
}

const idle = async () => {
  // @ts-expect-error
  if (globalThis.requestIdleCallback) {
    await new Promise((resolve) => requestIdleCallback(resolve))
  } else {
    await new Promise<void>((resolve) => queueMicrotask(resolve))
  }
}

const throttle = <T, F extends (...args: unknown[]) => T>(
  ms: number,
  fn: F,
) => {
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
      return undefined
    } else {
      return throttled(...args)
    }
  }
}

const main = async () => {
  const grid = document.body.querySelector(`.masonry`)
  const images = new Set(document.body.querySelectorAll(`img`))
  const layout_checkbox = document.body.querySelector(`#layout-checkbox`)

  const masonry =
    grid &&
    new Masonry(grid, {
      itemSelector: `.card`,
      percentPosition: true,
      initLayout: false,
      gutter: "#card-sizer",
    })

  layout_checkbox?.addEventListener(
    "change",
    async () => {
      await idle()
      masonry?.layout?.()
    },
    { passive: true },
  )

  const layout = throttle(16, async () => {
    await idle()
    masonry?.layout?.()
  })

  layout()

  for (const img of images) {
    img.onload = img.onerror = layout
  }

  for (const n of inc()) {
    if (!images.size || n > 60) {
      break
    } else {
      await idle()

      const old_size = images.size

      for (const img of images) {
        if (img.naturalWidth && img.naturalHeight) {
          images.delete(img)
        }
      }

      if (images.size !== old_size) {
        layout()
      }
    }
  }
}

await idle()
await main()
