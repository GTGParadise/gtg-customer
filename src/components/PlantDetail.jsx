import { Check } from 'lucide-react'
import { useCatalogRows } from '../hooks/useCatalogDb'
import AddToCart from './AddToCart'
import { catOf } from './CatalogPage'

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN')
// Accepts an array or a comma / new-line separated string
const listOf = v => Array.isArray(v) ? v : typeof v === 'string' ? v.split(/\n|,/).map(x => x.trim()).filter(Boolean) : []
// Field names are guessed: change here if your columns differ.
const stockOf = i => {
  if (i.stock_status) return i.stock_status
  if (i.in_stock === false) return 'Out of stock'
  if (typeof i.stock === 'number') return i.stock <= 0 ? 'Out of stock' : i.stock <= 5 ? `Only ${i.stock} left` : 'In stock'
  return 'In stock'
}

const sec = { background: '#fff', border: '1px solid #e3e8e4', borderRadius: 12, padding: 14, marginTop: 12 }
const h2 = { margin: '0 0 10px', fontSize: 17, color: '#1f6b3a' }

export default function PlantDetail({ item, kind, goHome, goKind, goCategory }) {
  const mats = useCatalogRows('material')
  const cat = catOf(item)
  const stock = stockOf(item)
  const out = /out/i.test(stock)
  const low = /only|low|few/i.test(stock)
  const features = listOf(item.features || item.special || item.highlights)
  const ids = listOf(item.care_material_ids || item.care_materials).map(String)
  const care = kind === 'plant' ? (mats || []).filter(m => ids.includes(String(m.id))).map(m => ({ ...m, kind: 'material' })) : []
  const desc = item.description || item.desc || item.about || ''
  const link = { color: 'inherit' }

  return (
    <main style={{ padding: '14px 12px 96px', maxWidth: 800, margin: '0 auto' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: '#5b6b60', marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <a style={link} href="#home" onClick={e => { e.preventDefault(); goHome() }}>Home</a><span>/</span>
        <a style={link} href="#" onClick={e => { e.preventDefault(); goKind() }}>{kind === 'plant' ? 'Plants' : 'Materials'}</a><span>/</span>
        <a style={link} href="#" onClick={e => { e.preventDefault(); goCategory(cat) }}>{cat}</a><span>/</span>
        <span>{item.name}</span>
      </nav>

      <div style={{ ...sec, marginTop: 0, padding: 0, overflow: 'hidden' }}>
        {item.img
          ? <img src={item.img} alt={item.name} style={{ width: '100%', maxHeight: 420, aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} />
          : <div style={{ aspectRatio: '1 / 1', maxHeight: 420, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, background: '#eef4ef' }}>{item.emoji}</div>}
        <div style={{ padding: 14 }}>
          <h1 style={{ margin: 0, fontSize: 24, color: '#1a2433' }}>{item.name}</h1>
          {item.sci && <small style={{ fontStyle: 'italic', opacity: .7 }}>{item.sci}</small>}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, margin: '10px 0' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1f6b3a' }}>{item.price ? money(item.price) : ''}</span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
              background: out ? '#fdecea' : low ? '#fff4d6' : '#e6f4ea', color: out ? '#c62828' : low ? '#8a5a00' : '#1f6b3a' }}>{stock}</span>
            <a href="#" onClick={e => { e.preventDefault(); goCategory(cat) }} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#eef4ef', color: '#1f6b3a', textDecoration: 'none' }}>{cat}</a>
          </div>
          {out
            ? <button type="button" disabled style={{ width: '100%', height: 44, border: 'none', borderRadius: 10, background: '#e3e8e4', color: '#7a877f', font: 'inherit', fontWeight: 600 }}>Out of stock</button>
            : <AddToCart item={{ ...item, kind }} />}
        </div>
      </div>

      {desc && <section style={sec}><h2 style={h2}>Description</h2><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: '#3d4d43' }}>{desc}</p></section>}

      {features.length > 0 && <section style={sec}><h2 style={h2}>Special things</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {features.map(f => <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, color: '#3d4d43' }}>
            <Check size={18} color="#1f6b3a" style={{ flexShrink: 0, marginTop: 1 }} />{f}</li>)}
        </ul></section>}

      {care.length > 0 && <section style={sec}><h2 style={h2}>Plant care suggestions</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {care.map(m => <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'center', border: '1px solid #e3e8e4', borderRadius: 10, padding: 8 }}>
            {m.img ? <img src={m.img} alt={m.name} loading="lazy" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              : <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: '#eef4ef', borderRadius: 8, flexShrink: 0 }}>{m.emoji}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14, fontWeight: 600 }}><Check size={16} color="#1f6b3a" />{m.name}</div>
              <div style={{ fontSize: 13, color: '#1f6b3a', fontWeight: 600 }}>{m.price ? money(m.price) : ''}</div>
            </div>
            <div style={{ width: 120, flexShrink: 0 }}><AddToCart item={m} /></div>
          </div>)}
        </div></section>}
    </main>
  )
}
