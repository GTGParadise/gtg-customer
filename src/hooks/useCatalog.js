import { useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'
import { defaultPlants, defaultMaterials, defaultPackages, defaultContact } from '../data/defaults'
// Reads the same config/gallery rows as the original app; falls back to bundled defaults.
// 'site' holds brand text, colors, section toggles and services published from the admin app.
const SRC = [['plants', 'config', 'plants'], ['materials', 'config', 'materials'], ['packages', 'config', 'packages'],
  ['contact', 'config', 'contact'], ['slots', 'config', 'slots'], ['site', 'config', 'site']]
export function useCatalog() {
  const [d, setD] = useState({ plants: defaultPlants, materials: defaultMaterials, packages: defaultPackages,
    contact: defaultContact, slots: {}, site: {} })
  const [status, setStatus] = useState(configured ? 'loading' : 'offline')
  useEffect(() => {
    if (!configured) return
    Promise.all(SRC.map(async ([k, table, id]) => {
      const { data } = await supabase.from(table).select('*').eq('id', id).maybeSingle()
      return [k, data?.value]
    })).then(r => {
      // Empty lists keep the built-in defaults instead of blanking the page
      const live = r.filter(([, v]) => v != null && !(Array.isArray(v) && v.length === 0))
      setD(p => ({ ...p, ...Object.fromEntries(live) })); setStatus('ready')
    }).catch(() => setStatus('error'))
  }, [])
  return { ...d, status }
}
