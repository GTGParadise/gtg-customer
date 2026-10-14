import { useRef, useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { supabase, configured } from '../lib/supabase'
import { Title, Img } from './Shared'

// Photos come from Supabase Storage (BUCKET); title, description and location come from the gallery_photos table.
// Nothing is bundled in the app: with no rows, the section stays hidden.
const BUCKET = 'gallery'
const TABLE = 'gallery_photos'
// Marquee: the auto-scrolling, looping strip used by the gallery (and reused by Services).
export function Marquee({ items, render }) {
  const trackRef = useRef(null)
  const paused = useRef(false)
  const timer = useRef(null)
  const pos = useRef(0)

  const hold = () => { clearTimeout(timer.current); paused.current = true }
  const release = (delay = 1800) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { paused.current = false }, delay)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el || items.length < 2) return
    const SPEED = 35 // pixels per second, change to taste
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf, last = performance.now()
    const setW = () => el.scrollWidth / 3
    el.scrollLeft = pos.current = setW()

    const tick = now => {
      const dt = Math.min(now - last, 50) / 1000
      last = now
      const w = setW()
      if (!paused.current && !reduce && w > el.clientWidth) {
        pos.current += SPEED * dt
        if (pos.current >= w * 2) pos.current -= w
        el.scrollLeft = pos.current
      } else {
        if (!paused.current) {
          if (el.scrollLeft >= w * 2) el.scrollLeft -= w
          else if (el.scrollLeft < w * 0.5) el.scrollLeft += w
        }
        pos.current = el.scrollLeft
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); clearTimeout(timer.current) }
  }, [items.length])

  const n = items.length
  return <div className="g-marquee" ref={trackRef}
    onTouchStart={hold} onTouchEnd={() => release()} onTouchCancel={() => release()}
    onMouseEnter={hold} onMouseLeave={() => release(300)}
    onWheel={() => { hold(); release() }}>
    {[...items, ...items, ...items].map((it, i) => render(it, i, i < n || i >= n * 2))}
  </div>
}

// Gallery section: auto-scrolling marquee of work photos.
export function Gallery() {
  const [items, setItems] = useState([])
  useEffect(() => {
    if (!configured) return
    let off = false
    supabase.from(TABLE).select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: false })
      .then(({ data }) => {
        if (off || !data) return
        setItems(data.map(r => ({ ...r,
          src: r.image_path ? supabase.storage.from(BUCKET).getPublicUrl(r.image_path).data.publicUrl : '' })))
      }).catch(() => {})
    return () => { off = true }
  }, [])
  if (!items.length) return null
  return <section id="gallery"><div className="wrap"><Title tag="Our Work" h="Garden Gallery" p="Real terrace gardens we've created across Coimbatore" />
    <Marquee items={items} render={(g, i, hid) => <figure key={g.id + '-' + i} className="card media" aria-hidden={hid}>
      <Img cls="ratio" src={g.src} emoji="🌿" alt={g.title || 'Garden photo'} />
      <figcaption>
        {g.title && <b>{g.title}</b>}
        {g.description && <span>{g.description}</span>}
        {g.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} />{g.location}</span>}
      </figcaption></figure>} /></div></section>
}
