import { useEffect } from 'react'
import { X } from 'lucide-react'
export default function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={'modal' + (wide ? ' wide' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
export function Field({ label, error, children }) {
  return <label className="field"><span>{label}</span>{children}{error && <small className="err" role="alert">{error}</small>}</label>
}
