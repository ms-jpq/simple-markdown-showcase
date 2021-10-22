const header_menu = document.body.querySelector(`header > button`);
const times = document.body.querySelectorAll(`time`);

for (const el of times) {
  el.innerText = new Date(el.dateTime).toLocaleString();
}

header_menu?.addEventListener("click", () =>
  document.body.classList.toggle("col2")
);

