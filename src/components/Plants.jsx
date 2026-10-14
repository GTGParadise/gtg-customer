import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { supabase, configured } from '../lib/supabase'
import { Title, Img } from './Sections'

// Plants come from the `plants` table (photos in the `plants` Storage bucket).
// If the table has no rows (or the backend is not configured), the `items`
// passed from App.jsx (config row / bundled defaults) are shown instead.
const BUCKET = 'plants'
const TABLE = 'plants'
const STEP = 4
const CATS = { food: 'Edible plants', ornamental: 'Ornamental plants', indoor: 'Indoor plants' }

function More({ shown, total, setShown }) {
  const left = total - shown
  if (total <= STEP) return null
  return <div className="more">{left > 0
    ? <button className="btn outline" aria-expanded="false" onClick={() => setShown(n => n + STEP)}>Show {Math.min(STEP, left)} more <ChevronDown size={18} /></button>
    : <button className="btn outline" aria-expanded="true" onClick={() => setShown(STEP)}>Show less <ChevronDown size={18} className="rot" /></button>}</div>
}

function PlantCard({ p }) {
  return <article className="card item">
    <Img cls="ratio sq" src={p.img} emoji={p.emoji} alt={p.name} />
    <div className="pad">
      <b>{p.name}</b>
      {p.sci && <i>{p.sci}</i>}
      {p.desc && <p className="desc">{p.desc}</p>}
      {p.price ? <span className="price">₹{p.price}</span> : null}
    </div>
  </article>
}

function PlantGroup({ title, list }) {
  const [shown, setShown] = useState(STEP)
  return <div>
    <h3 className="cat">{title}</h3>
    <div className="grid g-items">
      {list.slice(0, shown).map(p => <PlantCard key={p.id} p={p} />)}
    </div>
    <More shown={shown} total={list.length} setShown={setShown} />
  </div>
}

export function Plants({ items = [] }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    if (!configured) return
    let off = false
    supabase.from(TABLE).select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      .then(({ data }) => {
        if (off || !data || !data.length) return
        setRows(data.filter(r => r.active !== false).map(r => ({
          id: r.id,
          name: r.name,
          sci: r.scientific_name || '',
          type: r.type || 'ornamental',
          desc: r.description || '',
          price: r.price,
          emoji: r.emoji || '🌿',
          img: r.image_path
            ? supabase.storage.from(BUCKET).getPublicUrl(r.image_path).data.publicUrl
            : ''
        })))
      }).catch(() => {})
    return () => { off = true }
  }, [])

  const list = rows.length ? rows : items
  const types = [...new Set(list.map(p => p.type))]

  return <section id="plants"><div className="wrap">
    <Title tag="Our Collection" h="Plants We Install" p="A curated selection of plants perfect for Coimbatore's climate" />
    {types.map(t => <PlantGroup key={t} title={CATS[t] || t} list={list.filter(p => p.type === t)} />)}
  </div></section>
}

export default Plants
