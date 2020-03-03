export const $ = <E extends Element = Element>(selector: string) =>
  (document.querySelector(selector) || undefined) as E | undefined

export const $$ = <E extends Element = Element>(selector: string) =>
  [...document.querySelectorAll(selector)] as E[]
