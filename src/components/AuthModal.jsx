
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Modal, { Field } from './Modal'
import { useAuth } from '../hooks/useAuth'

function normalizeEmail(email) {
  const value = email.trim()

  // Add @gmail.com only when the user enters no email domain.
  if (value && !value.includes('@')) {
    return `${value}@gmail.com`
  }

  return value
}

export default function AuthModal({ mode: m0, onClose, toast }) {
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState(m0)
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    location: ''
  })

  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const set = key => event => {
    const value = event.target.value

    setF(prev => ({ ...prev, [key]: value }))

    if (err) setErr('')
  }

  async function submit(event) {
    event.preventDefault()

    if (busy) return

    setErr('')

    const email = normalizeEmail(f.email)

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setErr(
        'Enter a valid email address or Gmail username.'
      )
    }

    if (f.password.length < 6) {
      return setErr('Password must be at least 6 characters.')
    }

    if (mode === 'register') {
      if (!f.name.trim() || !f.whatsapp.trim()) {
        return setErr(
          'Name and WhatsApp number are required.'
        )
      }

      if (!f.confirmPassword) {
        return setErr('Please confirm your password.')
      }

      if (f.password !== f.confirmPassword) {
        return setErr('Passwords do not match.')
      }
    }

    setBusy(true)

    try {
      const { data, error } =
        mode === 'signin'
          ? await signIn(email, f.password)
          : await signUp(
              email,
              f.password,
              f.name.trim(),
              f.whatsapp.trim(),
              f.location.trim()
            )

      if (error) {
        if (/already registered/i.test(error.message)) {
          setErr(
            'An account with this email already exists. Please sign in.'
          )
        } else if (mode === 'signin') {
          setErr('Incorrect email or password.')
        } else if (/rate limit exceeded/i.test(error.message)) {
          setErr(
            'Too many signup emails were requested. Please try again later.'
          )
        } else {
          setErr(error.message || 'Unable to create your account.')
        }

        return
      }

      if (mode === 'register' && !data?.session) {
        toast(
          'Account created. Check your email to confirm, then sign in.'
        )
      } else {
        toast(
          mode === 'signin'
            ? 'Signed in.'
            : 'Account created. Welcome!'
        )
      }

      onClose()
    } catch {
      setErr('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode() {
    setErr('')
    setMode(current =>
      current === 'signin' ? 'register' : 'signin'
    )
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <Modal
      title={mode === 'signin' ? 'Sign in' : 'Create account'}
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate>
        {/* Registration details */}
        {mode === 'register' && (
          <>
            <Field label="Full name">
              <input
                type="text"
                value={f.name}
                onChange={set('name')}
                autoComplete="name"
                placeholder="Enter your full name"
                required
              />
            </Field>

            <Field label="WhatsApp number">
              <input
                type="tel"
                value={f.whatsapp}
                onChange={set('whatsapp')}
                autoComplete="tel"
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </Field>

            <Field label="Location (optional)">
              <input
                type="text"
                value={f.location}
                onChange={set('location')}
                placeholder="Area in Coimbatore"
              />
            </Field>
          </>
        )}

        {/* Email appears after the registration details */}
        <Field label="Email">
          <input
            type="text"
            inputMode="email"
            value={f.email}
            onChange={set('email')}
            autoComplete="email"
            placeholder="Enter email or Gmail username"
            required
          />
        </Field>

        <Field label="Password">
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              value={f.password}
              onChange={set('password')}
              autoComplete={
                mode === 'signin'
                  ? 'current-password'
                  : 'new-password'
              }
              minLength={6}
              placeholder="Enter password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(current => !current)
              }
              aria-label={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              {showPassword
                ? <EyeOff size={18} />
                : <Eye size={18} />}
            </button>
          </div>
        </Field>

        {/* Confirm Password appears only during registration */}
        {mode === 'register' && (
          <Field label="Confirm Password">
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={f.confirmPassword}
                onChange={set('confirmPassword')}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                aria-invalid={
                  !!f.confirmPassword &&
                  f.password !== f.confirmPassword
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(current => !current)
                }
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirmPassword
                  ? <EyeOff size={18} />
                  : <Eye size={18} />}
              </button>
            </div>

            {f.confirmPassword &&
              f.password !== f.confirmPassword && (
                <p className="err" role="alert">
                  Passwords do not match.
                </p>
              )}
          </Field>
        )}

        {err && (
          <p className="err box" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          className="btn primary full"
          disabled={busy}
        >
          {busy
            ? 'Please wait…'
            : mode === 'signin'
              ? 'Sign in'
              : 'Create account'}
        </button>

        <p className="switch">
          {mode === 'signin'
            ? 'New here? '
            : 'Already registered? '}

          <button
            type="button"
            className="link"
            onClick={switchMode}
          >
            {mode === 'signin'
              ? 'Create an account'
              : 'Sign in'}
          </button>
        </p>
      </form>
    </Modal>
  )
}
