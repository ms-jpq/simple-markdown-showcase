import { $ } from "nda/dist/browser/dom"

const header_menu = $<HTMLButtonElement>(`header > button`)!
header_menu.addEventListener("click", () =>
  document.body.classList.toggle("col2"),
)
