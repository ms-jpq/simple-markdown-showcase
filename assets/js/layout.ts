import { $, $$ } from "nda/dist/browser/dom";

const header_menu = $<HTMLButtonElement>(`header > button`)!;
const times = $$<HTMLTimeElement>(`time`)!;

for (const el of times) {
  el.innerText = new Date(el.dateTime).toLocaleString();
}

header_menu.addEventListener("click", () =>
  document.body.classList.toggle("col2")
);

