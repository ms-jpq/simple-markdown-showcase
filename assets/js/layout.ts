// @ts-expect-error
if (globalThis.requestIdleCallback) {
  await new Promise((resolve) => requestIdleCallback(resolve))
}

const times = document.body.querySelectorAll(`time`)
for (const el of times) {
  const time = new Date(el.dateTime)
  el.textContent = time.toLocaleString(undefined, { hour12: false })
}
