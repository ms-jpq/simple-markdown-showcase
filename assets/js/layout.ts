const times = document.body.querySelectorAll(`time`)

for (const el of times) {
  const time = new Date(el.dateTime)
  el.textContent = time.toLocaleString(undefined, { hour12: false })
}
