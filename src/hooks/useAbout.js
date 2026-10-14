import { useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'

// One shared fetch for About + SocialDock
let cache = null
const load = () => {
  if (!cache) {
    cache = supabase.from('about_content').select('*').eq('id', 1).maybeSingle()
      .then(({ data, error }) => { if (error) { cache = null; throw error } return data })
  }
  return cache
}

export function useAbout() {
  const [about, setAbout] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!configured) { setStatus('error'); return }
    let alive = true
    load().then(d => { if (alive) { setAbout(d); setStatus('ready') } })
      .catch(() => { if (alive) setStatus('error') })
    return () => { alive = false }
  }, [])

  return { about, status }
}
