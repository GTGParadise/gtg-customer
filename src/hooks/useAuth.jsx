import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  useEffect(() => {
    if (!configured) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle().then(({ data }) => setProfile(data))
  }, [session])
  const u = session?.user, m = u?.user_metadata || {}
  const user = u && { uid: u.id, email: u.email,
    name: profile?.name || profile?.username || m.name || u.email.split('@')[0],
    whatsapp: profile?.whatsapp || m.whatsapp || '', location: profile?.location || m.location || '' }
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signUp = (email, password, name, whatsapp, location) =>
    supabase.auth.signUp({ email, password, options: { data: { name, whatsapp, location } } })
  const signOut = () => supabase.auth.signOut()
  return <Ctx.Provider value={{ user, signIn, signUp, signOut }}>{children}</Ctx.Provider>
}
