import { Check, Phone, Mail, MapPin } from 'lucide-react'
import { useAbout } from '../hooks/useAbout'

export default function About() {
  const { about, status } = useAbout()
  if (status === 'loading' || !about) return null

  const points = Array.isArray(about.points) ? about.points : []
  const stats = Array.isArray(about.stats) ? about.stats : []
  const row = { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }

  return (
    <section id="about" className="sec">
      <div className="wrap">
        <h2>{about.title}</h2>
        {about.subtitle && <p className="sub">{about.subtitle}</p>}
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: about.image_url ? 'repeat(auto-fit,minmax(280px,1fr))' : '1fr', alignItems: 'center' }}>
          {about.image_url && <img src={about.image_url} alt={about.title} loading="lazy" style={{ width: '100%', borderRadius: 12 }} />}
          <div>
            {about.body && about.body.split('\n').map((p, i) => <p key={i}>{p}</p>)}
            {points.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
                {points.map((p, i) => (
                  <li key={i} style={row}><Check size={18} style={{ flexShrink: 0, marginTop: 3 }} /><span>{p}</span></li>
                ))}
              </ul>
            )}
            {stats.length > 0 && (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', margin: '16px 0' }}>
                {stats.map((s, i) => <div key={i}><b style={{ fontSize: 24 }}>{s.value}</b><div>{s.label}</div></div>)}
              </div>
            )}
            {(about.phone || about.email || about.address) && (
              <div style={{ marginTop: 16 }}>
                {about.phone && <div style={row}><Phone size={18} style={{ marginTop: 3 }} /><a href={`tel:+91${about.phone}`}>+91 {about.phone}</a></div>}
                {about.email && <div style={row}><Mail size={18} style={{ marginTop: 3 }} /><a href={`mailto:${about.email}`}>{about.email}</a></div>}
                {about.address && <div style={row}><MapPin size={18} style={{ marginTop: 3 }} /><span>{about.address}</span></div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
