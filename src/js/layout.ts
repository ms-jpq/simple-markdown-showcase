import { $, $$ } from "../domain_agnostic/dom"
import Masonry from "masonry-layout"

const masonry = new Masonry($(`.grid`)!, {
  itemSelector: `.grid-item`,
})

console.log(":D")
