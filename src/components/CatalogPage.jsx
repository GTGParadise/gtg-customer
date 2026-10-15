import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, LayoutGrid, List } from 'lucide-react'
import { useCatalogRows } from '../hooks/useCatalogDb'
import AddToCart from './AddToCart'

export const catOf = i => i.category || i.cat || i.group || 'Other'
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
  const [dd, setDd] = useState(false)
  const ddRef = useRef(null)
  useEffect(() => {   // close the dropdown on outside tap / Escape
    if (!dd) return
    const out = e => { if (!ddRef.current?.contains(e.target)) setDd(false) }
    const esc = e => e.key === 'Escape' && setDd(false)
    document.addEventListener('pointerdown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc) }
  }, [dd])
  const title = kind === 'plant' ? 'Plants' : 'Materials'
  const list = rows === null ? [] : rows.length ? rows : fallback.map(i => ({ ...i, category: catOf(i) }))
  const cats = ['All', ...new Set(list.map(catOf))]
  const shown = (cat === 'All' ? list : list.filter(i => catOf(i) === cat)).map(i => ({ ...i, kind }))

  const toggle = on => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: 'none', cursor: 'pointer',
    background: on ? '#1f6b3a' : '#fff', color: on ? '#fff' : '#1f6b3a' })

  const thumb = (i, size) => i.img
    ? <img src={i.img} alt={i.name} loading="lazy" style={{ width: size, height: size, aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, background: '#eef4ef', flexShrink: 0 }}>{i.emoji}</div>

  return (
    <main style={{ padding: '14px 12px 96px', maxWidth: 1100, margin: '0 auto' }}>
      {/* category dropdown, centered at top */}
      <div ref={ddRef} style={{ position: 'relative', width: 'min(100%, 320px)', margin: '0 auto 14px' }}>
        <button type="button" onClick={() => setDd(o => !o)} aria-haspopup="listbox" aria-expanded={dd} aria-label="Category"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', height: 42, padding: '0 14px',
            border: '1px solid ' + (dd ? '#1f6b3a' : '#cfd8d2'), borderRadius: 10, background: '#fff', color: '#1f6b3a',
            font: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: dd ? '0 0 0 3px rgba(31,107,58,.15)' : 'none' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat === 'All' ? `All ${title.toLowerCase()}` : cat}</span>
          <ChevronDown size={18} style={{ flexShrink: 0, transition: 'transform .2s', transform: dd ? 'rotate(180deg)' : 'none' }} />
        </button>
        {dd && <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, maxHeight: 280, overflowY: 'auto',
          overscrollBehavior: 'contain', background: '#fff', border: '1px solid #e3e8e4', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.14)' }}>
          {cats.map(c => {
            const on = c === cat
            return <button key={c} type="button" role="option" aria-selected={on} onClick={() => { setCat(c); setDd(false) }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', padding: '12px 14px', border: 'none',
                boxShadow: 'inset 0 -1px 0 #eef2ef', background: on ? '#f1f8f3' : '#fff', color: on ? '#1f6b3a' : '#1a2433',
                font: 'inherit', fontSize: 15, fontWeight: on ? 600 : 400, textAlign: 'left', cursor: 'pointer' }}>
              {c === 'All' ? `All ${title.toLowerCase()}` : c}{on && <Check size={16} />}
            </button>
          })}
        </div>}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 26, color: '#1f6b3a' }}>{cat === 'All' ? title : cat}</h1>
        <small><a href="#home" onClick={e => { e.preventDefault(); goHome() }}>Home</a> / {title}{cat !== 'All' && ` / ${cat}`}</small>
      </div>

      {/* count + view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 10px' }}>
        <span style={{ fontSize: 13, opacity: .75 }}>{rows === null ? 'Loading…' : `${shown.length} Products`}</span>
        <div style={{ display: 'flex', border: '1px solid #cfd8d2', borderRadius: 8, overflow: 'hidden' }}>
          <button type="button" style={toggle(view === 'grid')} onClick={() => setView('grid')} aria-label="Grid view" aria-pressed={view === 'grid'}><LayoutGrid size={18} /></button>
          <button type="button" style={toggle(view === 'list')} onClick={() => setView('list')} aria-label="List view" aria-pressed={view === 'list'}><List size={18} /></button>
        </div>
      </div>

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
