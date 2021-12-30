const header_menu = document.body.querySelector(`header > button`)
const times = document.body.querySelectorAll(`time`)

for (const el of times) {
  const time = new Date(el.dateTime)
  el.textContent = time.toLocaleString(undefined, { hour12: false })
}

header_menu?.addEventListener(
  "click",
  () => document.body.classList.toggle("overlay"),
  { passive: true },
)
