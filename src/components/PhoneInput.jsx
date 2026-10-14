// "+91" prefix + exactly 10 digits. `value` and `onChange` use the 10 digits only.
export const cleanPhone = v => {
  let d = String(v || '').replace(/\D/g, '')
  if (d.length > 10 && d.startsWith('91')) d = d.slice(2) // pasted "+91 98765 43210"
  return d.slice(0, 10)
}
export const isValidPhone = v => /^\d{10}$/.test(v || '')
export const toFullPhone = v => `+91${v}`

export default function PhoneInput({ value, onChange, required = true, id, name = 'phone', placeholder = '10-digit mobile number' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
      <span style={{ padding: '0 12px', display: 'flex', alignItems: 'center', background: '#f2f2f2', borderRight: '1px solid #ccc', fontWeight: 600 }}>+91</span>
      <input id={id} name={name} type="tel" inputMode="numeric" autoComplete="tel-national"
        maxLength={10} pattern="[0-9]{10}" title="Enter exactly 10 digits"
        required={required} placeholder={placeholder} value={value || ''}
        onChange={e => onChange(cleanPhone(e.target.value))}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 0, padding: '10px 12px', fontSize: 16, background: 'transparent' }} />
    </div>
  )
}
