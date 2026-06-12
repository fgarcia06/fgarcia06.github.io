/** Thin-line loader (the centered horizontal bar in the reference),
 * driven imperatively so route choreography can pulse it without renders. */

type LoaderListener = (visible: boolean, value: number) => void

let listener: LoaderListener | null = null
let visible = false
let value = 0

export const loader = {
  subscribe(fn: LoaderListener) {
    listener = fn
    fn(visible, value)
    return () => {
      if (listener === fn) listener = null
    }
  },
  show() {
    visible = true
    listener?.(visible, value)
  },
  hide() {
    visible = false
    listener?.(visible, value)
  },
  update(v: number) {
    value = v
    listener?.(visible, value)
  },
}
