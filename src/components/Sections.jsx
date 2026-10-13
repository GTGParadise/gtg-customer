import { useState } from 'react'
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
export function Gallery({ items }) {
  return <section id="gallery"><div className="wrap"><Title tag="Our Work" h="Garden Gallery" p="Real terrace gardens we've created across Coimbatore" />
    <div className="grid g-gallery">{items.map(g => <figure key={g.id} className="card media">
      <Img cls="ratio" src={g.mediaType === 'video' ? '' : g.src} emoji="🌿" alt={g.title} />
      <figcaption><b>{g.title}</b><span>{g.desc}</span></figcaption></figure>)}</div></div></section>
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
