import { useState } from 'react'
import { ArrowLeft, Menu, LayoutGrid, List } from 'lucide-react'
import { useCatalogRows } from '../hooks/useCatalogDb'
import AddToCart from './AddToCart'

const catOf = i => i.category || i.cat || i.group || 'Other'
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN')
// Field names are guessed from common spellings: change here if your columns differ.
const usesOf = i => i.uses || i.use || i.usage || i.benefits || i.description || ''
const careOf = i => i.care || i.care_tips || i.care_instructions || i.how_to_care || ''

const clamp = n => ({ display: '-webkit-box', WebkitLineClamp: n, WebkitBoxOrient: 'vertical', overflow: 'hidden' })

// Separate page for Plants or Materials: category dropdown, grid / list toggle, product cards.
export default function CatalogPage({ kind, fallback = [], goHome, initialCategory = '' }) {
  const rows = useCatalogRows(kind)
  const [cat, setCat] = useState(initialCategory || 'All')
  const [view, setView] = useState('grid')
  const title = kind === 'plant' ? 'Plants' : 'Materials'
  const list = rows === null ? [] : rows.length ? rows : fallback.map(i => ({ ...i, category: catOf(i) }))
  const cats = ['All', ...new Set(list.map(catOf))]
  const shown = (cat === 'All' ? list : list.filter(i => catOf(i) === cat)).map(i => ({ ...i, kind }))

  const iconBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #cfd8d2', borderRadius: 8,
    background: '#fff', color: '#1f6b3a', font: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }
  const toggle = on => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', cursor: 'pointer',
    background: on ? '#1f6b3a' : '#fff', color: on ? '#fff' : '#1f6b3a' })

  const thumb = (i, size) => i.img
    ? <img src={i.img} alt={i.name} loading="lazy" style={{ width: size, height: size, aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, background: '#eef4ef', flexShrink: 0 }}>{i.emoji}</div>

  return (
    <main style={{ padding: '14px 12px 96px', maxWidth: 1100, margin: '0 auto' }}>
      {/* back + menu */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <button type="button" style={iconBtn} onClick={() => goHome()} aria-label="Back"><ArrowLeft size={18} /> Back</button>
        <button type="button" style={iconBtn} onClick={() => window.dispatchEvent(new Event('gtg:open-menu'))} aria-label="Open menu"><Menu size={18} /> Menu</button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 26, color: '#1f6b3a' }}>{cat === 'All' ? title : cat}</h1>
        <small><a href="#home" onClick={e => { e.preventDefault(); goHome() }}>Home</a> / {title}{cat !== 'All' && ` / ${cat}`}</small>
      </div>

      {/* category dropdown + view toggle */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <select value={cat} onChange={e => setCat(e.target.value)} aria-label="Category"
          style={{ flex: 1, minWidth: 0, height: 38, padding: '0 10px', border: '1px solid #cfd8d2', borderRadius: 8, background: '#fff', font: 'inherit', fontSize: 14, color: '#1a1a1a' }}>
          {cats.map(c => <option key={c} value={c}>{c === 'All' ? `All ${title.toLowerCase()}` : c}</option>)}
        </select>
        <div style={{ display: 'flex', border: '1px solid #cfd8d2', borderRadius: 8, overflow: 'hidden' }}>
          <button type="button" style={toggle(view === 'grid')} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={18} /></button>
          <button type="button" style={toggle(view === 'list')} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={18} /></button>
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 13, opacity: .75, margin: '8px 0 10px' }}>{rows === null ? 'Loading…' : `${shown.length} Products`}</div>

      {rows !== null && !shown.length && <p className="muted center">Nothing available here right now.</p>}

      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {shown.map(i => (
            <article key={i.kind + i.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e3e8e4', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>{thumb(i, '100%')}</div>
              <div style={{ padding: '8px 8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <b style={{ fontSize: 14, lineHeight: 1.25, ...clamp(2) }}>{i.name}</b>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1f6b3a' }}>{i.price ? money(i.price) : ''}</span>
                {usesOf(i) && <span style={{ fontSize: 12, lineHeight: 1.35, color: '#4a5a50', ...clamp(2) }}>{usesOf(i)}</span>}
                <div style={{ marginTop: 'auto', paddingTop: 6 }}><AddToCart item={i} /></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map(i => (
            <article key={i.kind + i.id} style={{ display: 'flex', gap: 12, background: '#fff', border: '1px solid #e3e8e4', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: 110, flexShrink: 0, overflow: 'hidden' }}>{thumb(i, 110)}</div>
              <div style={{ padding: '10px 10px 10px 0', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <b style={{ fontSize: 15, lineHeight: 1.25 }}>{i.name}</b>
                {i.sci && <small style={{ fontStyle: 'italic', opacity: .7 }}>{i.sci}</small>}
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1f6b3a' }}>{i.price ? money(i.price) : ''}</span>
                {usesOf(i) && <span style={{ fontSize: 13, lineHeight: 1.4, color: '#3d4d43' }}><b>Uses: </b>{usesOf(i)}</span>}
                {careOf(i) && <span style={{ fontSize: 13, lineHeight: 1.4, color: '#3d4d43' }}><b>Care: </b>{careOf(i)}</span>}
                <div style={{ marginTop: 'auto', paddingTop: 6 }}><AddToCart item={i} /></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
