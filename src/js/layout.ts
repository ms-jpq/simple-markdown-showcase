import { $ } from "../domain_agnostic/browser/dom"

const header_menu = $<HTMLButtonElement>(`header > button`)!
header_menu.onclick = () => document.body.classList.toggle("col2")
