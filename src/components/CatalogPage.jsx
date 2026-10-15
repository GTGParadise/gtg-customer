import { useState } from 'react'
import { useCatalogRows } from '../hooks/useCatalogDb'
import AddToCart from './AddToCart'

const catOf = i => i.category || i.cat || i.group || 'Other'
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN')

// Separate page for Plants or Materials: category chips on top, product grid below.
export default function CatalogPage({ kind, fallback = [], goHome }) {
  const rows = useCatalogRows(kind)
  const [cat, setCat] = useState('All')
  const title = kind === 'plant' ? 'Plants' : 'Materials'
  const list = rows === null ? [] : rows.length ? rows : fallback.map(i => ({ ...i, category: catOf(i) }))
  const cats = ['All', ...new Set(list.map(catOf))]
  const shown = (cat === 'All' ? list : list.filter(i => catOf(i) === cat)).map(i => ({ ...i, kind }))

  const chip = on => ({ flexShrink: 0, padding: '7px 14px', borderRadius: 999, cursor: 'pointer', font: 'inherit', fontSize: 14,
    border: on ? '1px solid #1f6b3a' : '1px solid #cfd8d2', background: on ? '#1f6b3a' : '#fff', color: on ? '#fff' : '#1a1a1a' })

  return (
    <main style={{ padding: '20px 12px 96px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 26, color: '#1f6b3a' }}>{cat === 'All' ? title : cat}</h1>
        <small><a href="#home" onClick={e => { e.preventDefault(); goHome() }}>Home</a> / {title}</small>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', overscrollBehaviorX: 'contain', paddingBottom: 10 }}>
        {cats.map(c => <button key={c} type="button" style={chip(cat === c)} onClick={() => setCat(c)}>{c === 'All' ? `All ${title.toLowerCase()}` : c}</button>)}
      </div>
      <div style={{ textAlign: 'right', fontSize: 13, opacity: .75, margin: '4px 0 10px' }}>{rows === null ? 'Loading…' : `${shown.length} Products`}</div>

      {rows !== null && !shown.length && <p className="muted center">Nothing available here right now.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 8 }}>
        {shown.map(i => (
          <article key={i.kind + i.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e3e8e4', borderRadius: 10, overflow: 'hidden' }}>
            {i.img
              ? <img src={i.img} alt={i.name} loading="lazy" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, background: '#eef4ef' }}>{i.emoji}</div>}
            <div style={{ padding: '8px 6px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'center' }}>
              <b style={{ fontSize: 13, lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{i.name}</b>
              {i.sci && <small style={{ fontStyle: 'italic', opacity: .7 }}>{i.sci}</small>}
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1f6b3a', minHeight: 18 }}>{i.price ? money(i.price) : ''}</span>
              <div style={{ marginTop: 'auto' }}><AddToCart item={i} /></div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
