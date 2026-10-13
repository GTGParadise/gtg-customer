import { useState } from 'react'
import Modal, { Field } from './Modal'
import { useAuth } from '../hooks/useAuth'
export default function AuthModal({ mode: m0, onClose, toast }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState(m0)
  const [f, setF] = useState({ name: '', email: '', password: '', whatsapp: '', location: '' })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = k => e => setF({ ...f, [k]: e.target.value })
  async function submit(e) {
    e.preventDefault(); if (busy) return
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.')
    if (f.password.length < 6) return setErr('Password must be at least 6 characters.')
    if (mode === 'register' && (!f.name.trim() || !f.whatsapp.trim())) return setErr('Name and WhatsApp number are required.')
    setBusy(true); setErr('')
    const { data, error } = mode === 'signin' ? await signIn(f.email, f.password)
      : await signUp(f.email, f.password, f.name.trim(), f.whatsapp.trim(), f.location.trim())
    setBusy(false)
    if (error) return setErr(/already registered/i.test(error.message) ? 'An account with this email already exists. Please sign in.'
      : mode === 'signin' ? 'Incorrect email or password.' : error.message)
    if (mode === 'register' && !data.session) toast('Account created. Check your email to confirm, then sign in.')
    else toast(mode === 'signin' ? 'Signed in.' : 'Account created. Welcome!')
    onClose()
  }
  return (
    <Modal title={mode === 'signin' ? 'Sign in' : 'Create account'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {mode === 'register' && <Field label="Full name"><input value={f.name} onChange={set('name')} autoComplete="name" /></Field>}
        <Field label="Email"><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Password"><input type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} /></Field>
        {mode === 'register' && <>
          <Field label="WhatsApp number"><input type="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="+91 XXXXX XXXXX" /></Field>
          <Field label="Location (optional)"><input value={f.location} onChange={set('location')} placeholder="Area in Coimbatore" /></Field></>}
        {err && <p className="err box" role="alert">{err}</p>}
        <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
        <p className="switch">{mode === 'signin' ? 'New here? ' : 'Already registered? '}
          <button type="button" className="link" onClick={() => { setErr(''); setMode(mode === 'signin' ? 'register' : 'signin') }}>
            {mode === 'signin' ? 'Create an account' : 'Sign in'}</button></p>
      </form>
    </Modal>
  )
}
