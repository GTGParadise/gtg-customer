import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configured = Boolean(url && key)
export const supabase = configured ? createClient(url, key) : null
// Same camelCase <-> snake_case mapping the original app used ("id" <-> "client_id").
export const toSnake = o => Object.fromEntries(Object.entries(o).map(([k, v]) =>
  [k === 'id' ? 'client_id' : k.replace(/[A-Z]/g, c => '_' + c.toLowerCase()), v]))
export const toCamel = r => Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'id').map(([k, v]) =>
  [k === 'client_id' ? 'id' : k.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase()), v]))
export async function insertRow(table, doc) {
  if (!configured) throw new Error('Backend not configured')
  const { error } = await supabase.from(table).insert(toSnake(doc))
  if (error) throw error
}
export async function myRows(table, uid) {
  const { data, error } = await supabase.from(table).select('*').eq('user_id', uid)
  if (error) throw error
  return data.map(toCamel).sort((a, b) => String(b.time || b.createdAt).localeCompare(String(a.time || a.createdAt)))
}
