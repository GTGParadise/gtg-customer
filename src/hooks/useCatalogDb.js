import { useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'

const pub = (bucket, path) => (path ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : '')

// kind: 'plant' | 'material'. Returns null while loading, then an array (empty if none or on error).
export function useCatalogRows(kind) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    if (!configured) { setRows([]); return }
    let off = false
    ;(async () => {
      if (kind === 'plant') {
        const [p, t] = await Promise.all([
          supabase.from('plants').select('*').eq('is_active', true).order('name'),
          supabase.from('plant_types').select('key,label,sort_order'),
        ])
        if (off) return
        if (p.error || !p.data) return setRows([])
        const label = {}, sort = {}
        ;(t.data || []).forEach(x => { label[x.key] = x.label || x.key; sort[x.key] = x.sort_order ?? 999 })
        setRows(p.data.map(r => ({
          id: r.id, name: r.name, sci: r.tamil_name || '', category: label[r.category] || r.category || 'Other',
          sort: sort[r.category] ?? 999, price: r.price, emoji: '🌿', img: pub('plants', r.image_path),
          description: r.description || '', features: r.features || [],
          stock_status: r.stock_status || 'In stock', care_material_ids: r.care_material_ids || [],
        })).sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name)))
      } else {
        const m = await supabase.from('materials').select('*').eq('is_active', true).order('name')
        if (off) return
        if (m.error || !m.data) return setRows([])
        setRows(m.data.map(r => ({
          id: r.id, name: r.name, sci: '', category: r.category || 'Materials', price: r.price, emoji: '🧰', img: pub('materials', r.image_path),
          description: r.description || '',
        })))
      }
    })().catch(() => { if (!off) setRows([]) })
    return () => { off = true }
  }, [kind])
  return rows
}
