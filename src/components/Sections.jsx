import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown } from 'lucide-react'
export const Title = ({ tag, h, p }) => <div className="sec-title"><span>{tag}</span><h2>{h}</h2>{p && <p>{p}</p>}</div>
export function Img({ src, emoji, alt, cls }) {
  const [bad, setBad] = useState(!src)
  return bad ? <div className={'ph ' + (cls || '')} aria-label={alt}>{emoji || '🌿'}</div>
    : <img className={cls} src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />
}
export function Hero() {
  return <section className="hero" id="home"><div className="wrap">
    <span className="tag">Gardening Services in Coimbatore</span>
    <h1>Transform Your Space into a <em>Green Paradise</em></h1>
    <p>Professional gardening solutions for homes, terraces, balconies, and outdoor spaces in Coimbatore</p>
    <div className="row"><a className="btn primary lg" href="#visit-booking">Book a Site Visit</a><a className="btn light lg" href="#services">Explore Our Services</a></div>
  </div></section>
}

const REDUCE_Q = '(prefers-reduced-motion: reduce)'

export function Gallery({ items }) {
  const viewRef = useRef(null)
  const trackRef = useRef(null)
  const n = items.length
  const [reduce, setReduce] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(REDUCE_Q).matches
  )
  const [copies, setCopies] = useState(3)
  const sets = reduce ? 1 : copies

  // Follow the OS "reduce motion" setting live.
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(REDUCE_Q)
    const on = e => setReduce(e.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])

  // Render enough copies of the set that one set is always wider than the viewport.
  useEffect(() => {
    if (reduce || !n) return
    const el = viewRef.current, tr = trackRef.current
    if (!el || !tr) return
    const measure = () => {
      const k = tr.children
      if (k.length <= n) return
      const loop = k[n].offsetLeft - k[0].offsetLeft
      if (loop <= 0) return
      const need = Math.max(3, Math.ceil(el.clientWidth / loop) + 2)
      setCopies(c => (c === need ? c : need))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [reduce, n])

  // Auto-scroll loop + manual interaction.
  useEffect(() => {
    const el = viewRef.current, tr = trackRef.current
    if (!el || !tr || !n) return
    const kids = tr.children
    // Cloned sets are hidden from assistive tech and the tab order.
    for (let i = n; i < kids.length; i++) kids[i].setAttribute('inert', '')
    if (reduce) return

    const SPEED = 40          // px per second, right-to-left
    const RESUME_MS = 1500    // pause after the user stops interacting
    let loop = 0, pos = 0, lastSet = 0, raf = 0, last = 0, speed = 0, hold = 0
    let hovering = false, focused = false, pressed = false, visible = true
    let drag = null

    // Width of one full set, measured (never a fixed pixel value).
    const measure = () => { loop = kids.length > n ? kids[n].offsetLeft - kids[0].offsetLeft : 0 }
    // Keep the position inside the middle copy so there is always content on both sides.
    const wrap = v => {
      if (!loop) return v
      while (v >= 2 * loop) v -= loop
      while (v < loop) v += loop
      return v
    }
    const put = v => { el.scrollLeft = v; lastSet = el.scrollLeft }

    measure()
    pos = loop
    put(pos)

    const frame = t => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((t - last) / 1000, 0.05)
      last = t
      if (!visible || !loop) return
      const active = !hovering && !focused && !pressed && performance.now() > hold
      speed += ((active ? SPEED : 0) - speed) * Math.min(1, dt * 5) // ease in / out
      if (speed < 0.05) return
      pos = wrap(pos + speed * dt)
      put(pos)
    }

    const onScroll = () => {
      const sl = el.scrollLeft
      if (Math.abs(sl - lastSet) <= 2) return // our own movement
      hold = performance.now() + RESUME_MS     // user (touch, momentum, scrollbar, keys)
      speed = 0
      pos = sl
      if (loop && (sl >= 2 * loop || sl < loop)) {
        pos = wrap(sl)
        if (drag) drag.start += pos - sl
        put(pos)
      }
    }
    const touchHold = () => { hold = performance.now() + RESUME_MS }

    const onDown = e => {
      pressed = true
      touchHold()
      if (e.pointerType !== 'mouse' || e.button !== 0) return // touch uses native swipe
      drag = { x: e.clientX, start: el.scrollLeft, moved: false }
      try { el.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    }
    const onMove = e => {
      if (!drag) return
      const dx = e.clientX - drag.x
      if (!drag.moved && Math.abs(dx) < 4) return
      drag.moved = true
      el.classList.add('dragging')
      touchHold()
      el.scrollLeft = drag.start - dx
    }
    const onUp = e => {
      pressed = false
      touchHold()
      if (drag) {
        try { el.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
        drag = null
        el.classList.remove('dragging')
      }
    }
    const onEnter = e => { if (e.pointerType === 'mouse') hovering = true }
    const onLeave = e => { if (e.pointerType === 'mouse') hovering = false }
    const onFocusIn = () => { try { focused = el.matches(':focus-visible') } catch { focused = true } }
    const onFocusOut = () => { focused = false }
    const onKey = e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      hold = performance.now() + RESUME_MS * 2
      el.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * (loop / n || 300), behavior: 'smooth' })
    }
    const stopDrag = e => e.preventDefault()

    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('wheel', touchHold, { passive: true })
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)
    el.addEventListener('keydown', onKey)
    el.addEventListener('dragstart', stopDrag)

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { measure(); if (loop) { pos = wrap(el.scrollLeft); put(pos) } })
      : null
    ro?.observe(el)
    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([en]) => { visible = en.isIntersecting })
      : null
    io?.observe(el)

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', touchHold)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
      el.removeEventListener('keydown', onKey)
      el.removeEventListener('dragstart', stopDrag)
      ro?.disconnect()
      io?.disconnect()
      el.classList.remove('dragging')
    }
  }, [reduce, n, sets])

  return <section id="gallery"><div className="wrap"><Title tag="Our Work" h="Garden Gallery" p="Real terrace gardens we've created across Coimbatore" />
    <div className="gal">
      <div className="gal-viewport" ref={viewRef} tabIndex={0} role="region" aria-label="Garden gallery photos. Use the left and right arrow keys to scroll.">
        <div className="gal-track" ref={trackRef}>
          {Array.from({ length: sets }, (_, c) => items.map(g => <figure key={c + '-' + g.id} className="card media gal-item" aria-hidden={c > 0 ? 'true' : undefined}>
            <Img cls="ratio" src={g.mediaType === 'video' ? '' : g.src} emoji="🌿" alt={c > 0 ? '' : g.title} />
            <figcaption><b>{g.title}</b><span>{g.desc}</span></figcaption></figure>))}
        </div>
      </div>
    </div></div></section>
}

export function Services({ items }) {
  return <section id="services" className="alt"><div className="wrap"><Title tag="What We Do" h="Our Services" p="Gardening and landscaping services for homes and outdoor spaces in Coimbatore" />
    <div className="grid g-svc">{items.map(s => <article key={s.t} className="card pad"><div className="svc-ic">{s.i}</div><h3>{s.t}</h3><p>{s.d}</p>
      <a className="link" href="#contact">Enquire →</a></article>)}</div></div></section>
}
const CATS = { food: 'Edible plants', ornamental: 'Ornamental plants', indoor: 'Indoor plants' }
export function Plants({ items, onOrder }) {
  const types = [...new Set(items.map(p => p.type))]
  return <section id="plants"><div className="wrap"><Title tag="Our Collection" h="Plants We Install" p="A curated selection of plants perfect for Coimbatore's climate" />
    {types.map(t => <div key={t}><h3 className="cat">{CATS[t] || t}</h3><div className="grid g-items">
      {items.filter(p => p.type === t).map(p => <article key={p.id} className="card item"><Img cls="ratio sq" src={p.img} emoji={p.emoji} alt={p.name} />
        <div className="pad"><b>{p.name}</b>{p.sci && <i>{p.sci}</i>}{p.price ? <span className="price">₹{p.price}</span> : null}</div></article>)}</div></div>)}
    <div className="center"><button className="btn primary" onClick={onOrder}>Order plants &amp; materials</button></div></div></section>
}
export function Materials({ items, onOrder }) {
  const [q, setQ] = useState(''); const list = items.filter(m => m.name.toLowerCase().includes(q.toLowerCase()))
  return <section id="materials" className="alt"><div className="wrap"><Title tag="Installation Materials" h="Materials We Use" p="High-quality components chosen for durability and plant health" />
    <div className="search"><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search materials…" aria-label="Search materials" /></div>
    {list.length ? <div className="grid g-items">{list.map(m => <article key={m.id} className="card item"><Img cls="ratio sq" src={m.img} emoji={m.emoji} alt={m.name} />
      <div className="pad"><b>{m.name}</b>{m.price ? <span className="price">₹{m.price}</span> : null}</div></article>)}</div> : <p className="muted center">No materials match “{q}”.</p>}
    <div className="center"><button className="btn primary" onClick={onOrder}>Order plants &amp; materials</button></div></div></section>
}
export function Packages({ items, onPick }) {
  return <section id="packages"><div className="wrap"><Title tag="Maintenance Plans" h="Maintenance Packages" p="Choose a plan that fits your garden and budget" />
    <div className="grid g-pkg">{items.map(p => <article key={p.id} className={'card pad pkg' + (p.featured ? ' feat' : '')}>
      {p.featured && <span className="badge">Most popular</span>}<h3>{p.name}</h3><div className="pkg-price">₹{Number(p.price).toLocaleString('en-IN')}<small> {p.period}</small></div>
      <ul>{(p.features || []).map(f => <li key={f}>{f}</li>)}</ul><button className={'btn full ' + (p.featured ? 'primary' : 'outline')} onClick={() => onPick(p)}>Choose plan</button></article>)}</div></div></section>
}
const WHY = [['Local to Coimbatore', "We plan gardens around Coimbatore's climate and your space."], ['Free Quotation', 'Tell us your requirements and we will share a quotation.'],
  ['Easy to Reach', 'Call, WhatsApp or email us directly.'], ['Setup to Upkeep', 'From first plan to ongoing maintenance.']]
const STEPS = [['1. Consultation', 'Share your space and goals.'], ['2. Planning', 'We plan plants, layout and materials.'], ['3. Setup', 'Installation of your garden.'], ['4. Maintenance', 'Optional regular care visits.']]
const FAQ = [['Which areas do you serve?', 'We serve Coimbatore, Tamil Nadu.'], ['How do I get a quote?', 'Use the enquiry form below, or call or WhatsApp us on +91 80728 51669.'],
  ['Do you offer maintenance?', 'Yes, garden maintenance is one of our core services.'], ['Which services do you offer?', 'Home gardening, terrace gardening, balcony gardening, landscaping and garden maintenance.']]
export function About() {
  const [open, setOpen] = useState(0); const cards = a => <div className="grid g-info">{a.map(([t, d]) => <div key={t} className="card pad"><h3>{t}</h3><p>{d}</p></div>)}</div>
  return <section id="about" className="alt"><div className="wrap"><Title tag="About GTG Paradise" h="Why Choose GTG Paradise" p="Gardening services for homes, terraces and balconies in Coimbatore" />
    {cards(WHY)}<h3 className="cat mt">Our Process</h3>{cards(STEPS)}<h3 className="cat mt">Frequently Asked Questions</h3>
    <div className="faq">{FAQ.map(([q, a], i) => <div key={q} className="card"><button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{q}<ChevronDown size={18} className={open === i ? 'rot' : ''} /></button>{open === i && <p className="faq-a">{a}</p>}</div>)}</div></div></section>
  }
    
