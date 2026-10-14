// Home page: markup and all home styles live in this one file.
// The slide-in animation replays every time the home section scrolls back into view.
import { useEffect, useRef, useState } from 'react'
import { supabase, configured } from '../lib/supabase'

// Background photo is read from Supabase Storage: BUCKET / FOLDER. The newest image in the folder is used.
const BUCKET = 'images'          // <- change to your storage bucket name
const FOLDER = 'home-page-bg'
const IMG = /\.(jpe?g|png|webp|avif)$/i

function useStorageBg() {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!configured) return
    let off = false
    supabase.storage.from(BUCKET).list(FOLDER, { limit: 50, sortBy: { column: 'created_at', order: 'desc' } })
      .then(({ data }) => {
        const f = (data || []).find(x => IMG.test(x.name))
        if (f && !off) setUrl(supabase.storage.from(BUCKET).getPublicUrl(FOLDER + '/' + f.name).data.publicUrl)
      }).catch(() => {})
    return () => { off = true }
  }, [])
  return url
}

const css = `
@keyframes fromLeft  { from { opacity: 0; transform: translateX(-70px) } to { opacity: 1; transform: none } }
@keyframes fromRight { from { opacity: 0; transform: translateX(70px) }  to { opacity: 1; transform: none } }

.hero { overflow-x: hidden }
.hero:not(.in) .tag, .hero:not(.in) h1 span, .hero:not(.in) p, .hero:not(.in) .row a { opacity: 0 }
.hero.in .tag { animation: fromLeft .7s ease-out both }
.hero.in h1 .h-l { display: block; animation: fromLeft .8s ease-out .15s both }
.hero.in h1 .h-r { display: block; animation: fromRight .8s ease-out .3s both }
.hero.in p { animation: fromLeft .8s ease-out .45s both }
.hero.in .row a:first-child { animation: fromRight .8s ease-out .6s both }
.hero.in .row a:last-child { animation: fromLeft .8s ease-out .7s both }
.hero h1 .h-l, .hero h1 .h-r { display: block }

@media (prefers-reduced-motion: reduce) {
  .hero:not(.in) .tag, .hero:not(.in) h1 span, .hero:not(.in) p, .hero:not(.in) .row a { opacity: 1 }
  .hero.in .tag, .hero.in h1 span, .hero.in p, .hero.in .row a { animation: none }
}
`

export default function Home({ image }) {
  const stored = useStorageBg()
  image = stored || image
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // Background photo from the database; the green overlay keeps the text readable
  const bg = image ? {
    backgroundImage: 'linear-gradient(rgba(20,83,45,.78), rgba(20,83,45,.78)), url("' + String(image).replace(/"/g, '%22') + '")',
    backgroundSize: 'cover', backgroundPosition: 'center'
  } : undefined
  return <>
    <style>{css}</style>
    <section ref={ref} className={'hero' + (inView ? ' in' : '')} id="home" style={bg}><div className="wrap">
      <span className="tag">Gardening Services in Coimbatore</span>
      <h1><span className="h-l">Transform Your Space</span> <span className="h-r">into a <em>Green Paradise</em></span></h1>
      <p>Professional gardening solutions for homes, terraces, balconies, and outdoor spaces in Coimbatore</p>
      <div className="row"><a className="btn primary lg" href="#visit-booking">Book a Site Visit</a><a className="btn light lg" href="#services">Explore Our Services</a></div>
    </div></section>
  </>
}
