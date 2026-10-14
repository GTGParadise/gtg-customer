import { useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'
import { Title, More, Item, STEP } from './Sections'

const BUCKET = 'plants'
const TABLE = 'plants'
const CATS = { food: 'Edible plants', ornamental: 'Ornamental plants', indoor: 'Indoor plants' }

function PlantGroup({ title, list }) {
  const [shown, setShown] = useState(STEP)
  return <div><h3 className="cat">{title}</h3><div className="grid g-items">
    {list.slice(0, shown).map(p => <Item key={p.id} p={p}>{p.sci && <i>{p.sci}</i>}</Item>)}</div>
    <More shown={shown} total={list.length} setShown={setShown} /></div>
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
          sci: r.sci || r.scientific_name || '',
          type: r.type || 'ornamental',
          desc: r.desc || r.description || '',
          price: r.price,
          emoji: r.emoji || '🌿',
          img: r.image_path
            ? supabase.storage.from(BUCKET).getPublicUrl(r.image_path).data.publicUrl
            : (r.img || r.image_url || '')
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
