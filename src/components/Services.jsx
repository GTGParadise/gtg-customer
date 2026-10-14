import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import { supabase, configured } from '../lib/supabase'
import { Title, Img, Marquee } from './Sections'

// Services come from the `services` table (photos in the `services` Storage bucket).
// If the table has no rows (or the backend is not configured), the built-in
// `items` passed from App.jsx are shown instead.
const BUCKET = 'services'
const TABLE = 'services'

export function Services({ items = [] }) {
  const [rows, setRows] = useState([])
  useEffect(() => {
    if (!configured) return
    let off = false
    supabase.from(TABLE).select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true })
      .then(({ data }) => {
        if (off || !data || !data.length) return
        setRows(data.map(r => ({
          id: r.id, i: <Leaf />, t: r.title, d: r.description,
          src: r.image_path ? supabase.storage.from(BUCKET).getPublicUrl(r.image_path).data.publicUrl : ''
        })))
      }).catch(() => {})
    return () => { off = true }
  }, [])

  const list = rows.length ? rows : items
  return <section id="services" className="alt"><div className="wrap">
    <Title tag="What We Do" h="Our Services" p="Gardening and landscaping services for homes and outdoor spaces in Coimbatore" />
    <Marquee items={list} render={(s, i, hid) =>
      <article key={(s.id || s.t) + '-' + i} className="card pad" aria-hidden={hid}>
        {s.src ? <Img cls="ratio" src={s.src} emoji="🌿" alt={s.t} /> : <div className="svc-ic">{s.i}</div>}
        <h3>{s.t}</h3>
        {s.d && <p>{s.d}</p>}
        <a className="link" href="#contact" tabIndex={hid ? -1 : undefined}>Enquire →</a>
      </article>} />
  </div></section>
}

export default Services
