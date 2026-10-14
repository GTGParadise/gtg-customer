import { useState, useRef, useEffect, Children } from 'react'
import { Search, ChevronDown, MapPin } from 'lucide-react'
import { supabase, configured } from '../lib/supabase'

export const Title = ({ tag, h, p }) => <div className="sec-title"><span>{tag}</span><h2>{h}</h2>{p && <p>{p}</p>}</div>
export function Img({ src, emoji, alt, cls }) {
  const [bad, setBad] = useState(!src)
  return bad ? <div className={'ph ' + (cls || '')} aria-label={alt}>{emoji || '🌿'}</div>
    : <img className={cls} src={src} alt={alt} loading="lazy" onError={() => setBad(true)} />
}
// Hero moved to components/Home.jsx

// Marquee: the auto-scrolling, looping strip used by the gallery and Services.
export function Marquee({ items = [], render }) {
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

// Gallery: photos come from Supabase Storage (BUCKET); title, description and
// location come from the gallery_photos table. With no rows, the section stays hidden.
const BUCKET = 'gallery'
const TABLE = 'gallery_photos'
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

export function Services({ items = [] }) {
  return <section id="services" className="alt"><div className="wrap"><Title tag="What We Do" h="Our Services" p="Gardening and landscaping services for homes and outdoor spaces in Coimbatore" />
    <Marquee items={items} render={(s, i, hid) => <article key={s.t + '-' + i} className="card pad" aria-hidden={hid}><div className="svc-ic">{s.i}</div><h3>{s.t}</h3><p>{s.d}</p>
      <a className="link" href="#contact" tabIndex={hid ? -1 : undefined}>Enquire →</a></article>} /></div></section>
}
const CATS = { food: 'Edible plants', ornamental: 'Ornamental plants', indoor: 'Indoor plants' }
const STEP = 4
function More({ shown, total, setShown }) {
  const left = total - shown
  if (total <= STEP) return null
  return <div className="more">{left > 0
    ? <button className="btn outline" aria-expanded="false" onClick={() => setShown(n => n + STEP)}>Show {Math.min(STEP, left)} more <ChevronDown size={18} /></button>
    : <button className="btn outline" aria-expanded="true" onClick={() => setShown(STEP)}>Show less <ChevronDown size={18} className="rot" /></button>}</div>
}
const Item = ({ p, children }) => <article className="card item"><Img cls="ratio sq" src={p.img} emoji={p.emoji} alt={p.name} />
  <div className="pad"><b>{p.name}</b>{children}{p.desc && <p className="desc">{p.desc}</p>}{p.price ? <span className="price">₹{p.price}</span> : null}</div></article>
function PlantGroup({ title, list }) {
  const [shown, setShown] = useState(STEP)
  return <div><h3 className="cat">{title}</h3><div className="grid g-items">
    {list.slice(0, shown).map(p => <Item key={p.id} p={p}>{p.sci && <i>{p.sci}</i>}</Item>)}</div>
    <More shown={shown} total={list.length} setShown={setShown} /></div>
}
export function Plants({ items = [] }) {
  const types = [...new Set(items.map(p => p.type))]
  return <section id="plants"><div className="wrap"><Title tag="Our Collection" h="Plants We Install" p="A curated selection of plants perfect for Coimbatore's climate" />
    {types.map(t => <PlantGroup key={t} title={CATS[t] || t} list={items.filter(p => p.type === t)} />)}</div></section>
}
export function Materials({ items = [] }) {
  const [q, setQ] = useState(''); const [shown, setShown] = useState(STEP)
  const list = items.filter(m => String(m.name || '').toLowerCase().includes(q.toLowerCase()))
  return <section id="materials" className="alt"><div className="wrap"><Title tag="Installation Materials" h="Materials We Use" p="High-quality components chosen for durability and plant health" />
    <div className="search"><Search size={18} /><input value={q} onChange={e => { setQ(e.target.value); setShown(STEP) }} placeholder="Search materials…" aria-label="Search materials" /></div>
    {list.length ? <><div className="grid g-items">{list.slice(0, shown).map(m => <Item key={m.id} p={m} />)}</div>
      <More shown={shown} total={list.length} setShown={setShown} /></> : <p className="muted center">No materials match “{q}”.</p>}</div></section>
}
export function Snap({ children }) {
  const ref = useRef(null), n = Children.count(children)
  useEffect(() => {
    const el = ref.current, k = el && el.children[Math.floor((n - 1) / 2)]
    if (k) el.scrollLeft = k.offsetLeft - (el.clientWidth - k.offsetWidth) / 2
  }, [n])
  return <div className="snap" ref={ref}>{children}</div>
}
export function Packages({ items = [], onPick }) {
  return <section id="packages"><div className="wrap"><Title tag="Maintenance Plans" h="Maintenance Packages" p="Choose a plan that fits your garden and budget" />
    <Snap>{items.map(p => <article key={p.id} className={'card pad pkg' + (p.featured ? ' feat' : '')}>
      {p.featured && <span className="badge">Most popular</span>}<h3>{p.name}</h3><div className="pkg-price">₹{Number(p.price).toLocaleString('en-IN')}<small> {p.period}</small></div>
      <ul>{(p.features || []).map(f => <li key={f}>{f}</li>)}</ul><button className={'btn full ' + (p.featured ? 'primary' : 'outline')} onClick={() => onPick(p)}>Choose plan</button></article>)}</Snap></div></section>
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
