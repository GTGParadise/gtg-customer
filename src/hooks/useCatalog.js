import { useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'
import { defaultPlants, defaultMaterials, defaultPackages, defaultContact, defaultGallery } from '../data/defaults'
// Reads the same config/gallery rows as the original app; falls back to bundled defaults.
const SRC = [['plants', 'config', 'plants'], ['materials', 'config', 'materials'], ['packages', 'config', 'packages'],
  ['contact', 'config', 'contact'], ['gallery', 'gallery', 'items'], ['slots', 'config', 'slots']]
export function useCatalog() {
  const [d, setD] = useState({ plants: defaultPlants, materials: defaultMaterials, packages: defaultPackages,
    contact: defaultContact, gallery: defaultGallery, slots: {} })
  const [status, setStatus] = useState(configured ? 'loading' : 'offline')
  useEffect(() => {
    if (!configured) return
    Promise.all(SRC.map(async ([k, table, id]) => {
      const { data } = await supabase.from(table).select('*').eq('id', id).maybeSingle()
      return [k, data?.value]
    })).then(r => {
      setD(p => ({ ...p, ...Object.fromEntries(r.filter(([, v]) => v != null)) })); setStatus('ready')
    }).catch(() => setStatus('error'))
  }, [])
  return { ...d, status }
}
