import Masonry from "masonry-layout"

const idle = () =>
  new Promise<void>((resolve) =>
    // @ts-expect-error
    (globalThis.requestIdleCallback ? requestIdleCallback : queueMicrotask)(
      resolve,
    ),
  )

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
  const masonry = new Masonry(`.masonry`, {
    itemSelector: `.card`,
    gutter: "#card-sizer",
    initLayout: false,
  })

  document.body.querySelector(`#layout-checkbox`)?.addEventListener(
    "change",
    async () => {
      await idle()
      masonry.layout?.()
    },
    { passive: true },
  )

  const layout = throttle(16, () => masonry.layout?.())
  const onload = async () => {
    await idle()
    layout()
  }

  for (const img of document.body.querySelectorAll(`img`)) {
    img.onload = img.onerror = onload
  }
  await onload()
}

await idle()
await main()
