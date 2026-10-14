import { useEffect, useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { supabase, configured } from '../lib/supabase'
import { Title, Img } from './Sections'

// Materials come from the `materials` table (photos in the `materials` Storage bucket).
// If the table has no rows (or the backend is not configured), the `items`
// passed from App.jsx (config row / bundled defaults) are shown instead.
const BUCKET = 'materials'   // change if your photos are in another bucket
const TABLE = 'materials'    // change to your actual table name
const STEP = 4

function More({ shown, total, setShown }) {
  const left = total - shown
  if (total <= STEP) return null
  return <div className="more">{left > 0
    ? <button className="btn outline" aria-expanded="false" onClick={() => setShown(n => n + STEP)}>Show {Math.min(STEP, left)} more <ChevronDown size={18} /></button>
    : <button className="btn outline" aria-expanded="true" onClick={() => setShown(STEP)}>Show less <ChevronDown size={18} className="rot" /></button>}</div>
}

function MaterialCard({ p }) {
  return <article className="card item">
    <Img cls="ratio sq" src={p.img} emoji={p.emoji} alt={p.name} />
    <div className="pad">
      <b>{p.name}</b>
      {p.desc && <p className="desc">{p.desc}</p>}
      {p.price ? <span className="price">₹{p.price}</span> : null}
    </div>
  </article>
}

export function Materials({ items = [] }) {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(STEP)

  useEffect(() => {
    if (!configured) return
    let off = false
    supabase.from(TABLE).select('*')
      .eq('is_active', true)                       // remove if your table has no is_active column
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (off || !data || !data.length) return
        setRows(data.map(r => ({
          id: r.id,
          name: r.name,
          desc: r.description || r.desc || '',
          price: r.price || null,
          emoji: '🧰',
          img: r.image_path
            ? supabase.storage.from(BUCKET).getPublicUrl(r.image_path).data.publicUrl
            : ''
        })))
      }).catch(() => {})
    return () => { off = true }
  }, [])

  const all = rows.length ? rows : items
  const list = all.filter(m => String(m.name || '').toLowerCase().includes(q.toLowerCase()))

  return <section id="materials" className="alt"><div className="wrap">
    <Title tag="Installation Materials" h="Materials We Use" p="High-quality components chosen for durability and plant health" />
    <div className="search"><Search size={18} />
      <input value={q} onChange={e => { setQ(e.target.value); setShown(STEP) }} placeholder="Search materials…" aria-label="Search materials" />
    </div>
    {list.length
      ? <><div className="grid g-items">{list.slice(0, shown).map(m => <MaterialCard key={m.id} p={m} />)}</div>
        <More shown={shown} total={list.length} setShown={setShown} /></>
      : <p className="muted center">No materials match “{q}”.</p>}
  </div></section>
}

export default Materials
