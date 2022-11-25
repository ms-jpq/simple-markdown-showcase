await new Promise<void>((resolve) => queueMicrotask(resolve))

for (const el of document.body.querySelectorAll(`time`)) {
  el.textContent = new Date(el.dateTime).toLocaleString(undefined, {
    hour12: false,
  })
}
