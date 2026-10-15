import { useEffect } from 'react'

// Stops the page behind a menu/window from scrolling WITHOUT touching overflow styles,
// so the sticky top bar never jumps or disappears. Scrollable areas inside the menu still work.
const canScroll = el => {
  for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const s = getComputedStyle(el)
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) return true
    if (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth) return true
  }
  return false
}
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    const block = e => { if (!canScroll(e.target)) e.preventDefault() }
    document.addEventListener('touchmove', block, { passive: false })
    document.addEventListener('wheel', block, { passive: false })
    return () => { document.removeEventListener('touchmove', block); document.removeEventListener('wheel', block) }
  }, [active])
}
