import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useNotifications(toast) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!supabase || !user) { setItems([]); return }
    let active = true
    supabase.from('notifications').select('*')
      .order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => { if (active) setItems(data || []) })
    const ch = supabase.channel('notif-' + user.id)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        p => { setItems(l => [p.new, ...l]); toast(p.new.title) })
      .subscribe()
    return () => { active = false; supabase.removeChannel(ch) }
  }, [user, toast])

  const markAllRead = useCallback(async () => {
    if (!supabase) return
    await supabase.from('notifications').update({ read: true }).eq('read', false)
    setItems(l => l.map(n => ({ ...n, read: true })))
  }, [])

  return { items, unread: items.filter(n => !n.read).length, markAllRead }
}
