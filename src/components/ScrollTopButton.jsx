import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

// Bottom-left "back to top": hidden at the top, fades in as you scroll, fully visible at the bottom.
export default function ScrollTopButton() {
  const [o, setO] = useState(0)
  useEffect(() => {
    let raf = 0
    const upd = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight, y = window.scrollY
      setO(y < 40 || max <= 0 ? 0 : Math.min(1, 0.3 + 0.7 * (y / max)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(upd) }
    upd(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" tabIndex={o ? 0 : -1}
      style={{ position: 'fixed', left: 16, bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', zIndex: 900, width: 56, height: 56, borderRadius: '50%', border: 0,
        background: '#1f6b3a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)',
        opacity: o, pointerEvents: o ? 'auto' : 'none', transition: 'opacity .2s' }}>
      <ArrowUp size={24} />
    </button>
  )
}
