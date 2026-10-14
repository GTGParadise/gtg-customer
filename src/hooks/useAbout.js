import { useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'

export function useAbout() {
  const [about, setAbout] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    if (!configured) { setStatus('error'); return }
    let alive = true
    supabase.from('about_content').select('*').eq('id', 1).maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return
        if (error) setStatus('error')
        else { setAbout(data); setStatus('ready') }
      })
    return () => { alive = false }
  }, [])

  return { about, status }
}
