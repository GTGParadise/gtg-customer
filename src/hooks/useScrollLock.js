import { useEffect } from 'react'

// Stops the page behind a menu/window from scrolling WITHOUT touching overflow styles,
// so the sticky top bar never jumps or disappears. Scrollable areas inside the menu still work,
// and when such an area reaches its top/bottom the scroll no longer leaks to the page behind.
const canScroll = (el, dy) => {
  for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const s = getComputedStyle(el)
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) {
      if (dy === undefined) return true
      const atTop = el.scrollTop <= 0, atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      if (!((dy < 0 && atTop) || (dy > 0 && atEnd))) return true
    }
    if (/(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth && dy === undefined) return true
  }
  return false
}
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return
    let y = 0, x = 0
    const start = e => { y = e.touches[0].clientY; x = e.touches[0].clientX }
    const touch = e => {
      const dy = y - e.touches[0].clientY, dx = x - e.touches[0].clientX
      // sideways swipes inside horizontal scrollers (e.g. tabs) are left alone
      if (Math.abs(dx) > Math.abs(dy)) { if (!canScroll(e.target)) e.preventDefault(); return }
      if (!canScroll(e.target, dy)) e.preventDefault()
    }
    const wheel = e => { if (!canScroll(e.target, e.deltaY)) e.preventDefault() }
    document.addEventListener('touchstart', start, { passive: true })
    document.addEventListener('touchmove', touch, { passive: false })
    document.addEventListener('wheel', wheel, { passive: false })
    return () => {
      document.removeEventListener('touchstart', start)
      document.removeEventListener('touchmove', touch)
      document.removeEventListener('wheel', wheel)
    }
  }, [active])
}
