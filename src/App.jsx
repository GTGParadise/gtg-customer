import { useState, useCallback, useEffect } from 'react'
import { Home as HomeIcon, Building2, Flower2, Trees, Scissors, Leaf, ArrowLeft } from 'lucide-react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useCatalog } from './hooks/useCatalog'
import { useNotifications } from './hooks/useNotifications'
import { configured } from './lib/supabase'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import Home from './components/Home'
import { Gallery, Packages } from './components/Sections'
import About from './components/About'
import Plans from './components/Plans'
import SocialDock from './components/SocialDock'
import NotificationBell from './components/NotificationBell'
import OrderFab from './components/OrderFab'
import ScrollTopButton from './components/ScrollTopButton'
import { CartProvider, useCart } from './hooks/useCart'
import CatalogPage, { catOf } from './components/CatalogPage'
import PlantDetail from './components/PlantDetail'
import { useCatalogRows } from './hooks/useCatalogDb'
import { Services } from './components/Services'
import { BookVisit } from './components/Forms'
import { MineView } from './components/Orders'
import OrderPanel from './components/OrderPanel'
import NotificationsModal from './components/NotificationsModal'
const SERVICES = [
  { i: <HomeIcon />, t: 'Home Gardening', d: 'Plants, planters and care plans for home gardens and compounds.' },
  { i: <Building2 />, t: 'Terrace Gardening', d: 'Terrace garden design and setup with beds, drainage and plant selection.' },
  { i: <Flower2 />, t: 'Balcony Gardening', d: 'Space-saving balcony gardens with vertical and railing planters.' },
  { i: <Trees />, t: 'Landscaping', d: 'Landscape planning and installation for outdoor spaces.' },
  { i: <Scissors />, t: 'Garden Maintenance', d: 'Scheduled visits for pruning, feeding, pest care and plant replacement.' }]
// Same category logic as the catalog page (live rows first, built-in list as fallback)
const catsOf = (rows, fallback) => [...new Set((rows?.length ? rows : fallback || []).map(catOf).filter(c => c && c !== 'Other'))]
function Shell() {
  const cat = useCatalog(), { user } = useAuth()
  const plantRows = useCatalogRows('plant'), materialRows = useCatalogRows('material')
  const [modal, setModal] = useState(null), [toastMsg, setToastMsg] = useState(''), [tick, setTick] = useState(0)
  const toast = useCallback(m => { setToastMsg(m); setTimeout(() => setToastMsg(''), 4000) }, [])
  const notif = useNotifications(toast)
  const openAuth = m => setModal({ t: 'auth', m })
  const guard = fn => () => (user ? fn() : (toast('Please sign in first.'), openAuth('signin')))
  const refresh = () => setTick(t => t + 1)
  // Simple pages: 'home' | 'plants' | 'materials' (browser back button works between them)
  const [page, setPage] = useState('home')
  const [catFilter, setCatFilter] = useState('')
  const [detail, setDetail] = useState(null)   // product opened from a catalog page
  const [mine, setMine] = useState({ tab: 'orders', focus: null, k: 0 })   // 'mine' page: which tab / record to show
  const goPage = (p, c = '') => { window.history.pushState({ page: p, cat: c }, ''); setPage(p); setCatFilter(c); setDetail(null); window.scrollTo(0, 0) }
  const openItem = item => { window.history.pushState({ page, cat: catFilter, item }, ''); setDetail(item); window.scrollTo(0, 0) }
  // My orders / bookings / plans as a full page (header and footer stay). Used by the menu and by notifications.
  const goMine = (tab = 'orders', focus = null) => {
    const m = { tab, focus, k: Date.now() }
    window.history.pushState({ page: 'mine', mine: m }, '')
    setModal(null); setMine(m); setPage('mine'); setCatFilter(''); setDetail(null); window.scrollTo(0, 0)
  }
  const goHome = id => {
    if (page !== 'home') window.history.pushState({ page: 'home' }, '')
    setPage('home'); setCatFilter(''); setDetail(null)
    setTimeout(() => (id ? document.getElementById(id)?.scrollIntoView() : window.scrollTo(0, 0)), 60)
  }
  const pickPackage = p => {
    if (!user) { toast('Please sign in first.'); openAuth('signin'); return }
    toast(`${p.name} selected. Please choose a visit slot below.`)
    document.getElementById('visit-booking')?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    const h = e => { if (e.state?.order) return; setPage(e.state?.page || 'home'); setCatFilter(e.state?.cat || ''); setDetail(e.state?.item || null); if (e.state?.mine) setMine(e.state.mine) }
    window.addEventListener('popstate', h); return () => window.removeEventListener('popstate', h)
  }, [])
  const cart = useCart()
  useEffect(() => {  // "+" on a card while signed out
    const h = () => { toast('Please sign in first.'); openAuth('signin') }
    window.addEventListener('gtg:need-auth', h); return () => window.removeEventListener('gtg:need-auth', h)
  }, [toast])
  useEffect(() => {  // browser prompt if the page is refreshed or closed with items selected
    if (!cart.count) return
    const warn = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn)
  }, [cart.count])
  useEffect(() => { if (!user) cart.clear() }, [user])
  useEffect(() => { if (!user && page === 'mine') goHome() }, [user, page])
  // Content published from the admin app (falls back to built-in content)
  const on = k => cat.site?.sections?.[k] !== false
  const brand = cat.site?.brand, brandName = brand?.name || 'GTG Paradise'
  useEffect(() => { document.title = brandName }, [brandName])
  const services = cat.site?.services?.length ? cat.site.services.map(s => ({ i: <Leaf />, t: s.title, d: s.description })) : SERVICES
  return <>
    <Header openAuth={openAuth} openMine={() => goMine()}
      brand={brand} page={page} goPage={goPage} goHome={goHome} showPlants={on('plants')} showMaterials={on('materials')}
      plantCats={catsOf(plantRows, cat.plants)} materialCats={catsOf(materialRows, cat.materials)}
      right={user && <NotificationBell unread={notif.unread} onClick={() => setModal({ t: 'notifs' })} />} />
    {!configured && <div className="banner">Backend not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Showing built-in content; sign-in, orders and bookings are disabled.</div>}
    {cat.status === 'error' && <div className="banner">Could not load live data. Showing built-in content.</div>}
    {page === 'home' ? (
    <main>
        {on('hero') && <Home image={cat.site?.heroImage} />}
        {on('gallery') && <Gallery />}
        {on('services') && <Services items={services} />}
        {on('subscriptions') && <Plans openAuth={openAuth} toast={toast} refresh={refresh} />}
        {on('packages') && cat.packages?.length > 0 && <Packages items={cat.packages} onPick={pickPackage} />}
        {on('booking') && <BookVisit slots={cat.slots} openAuth={openAuth} toast={toast} refresh={refresh} />}
        {on('about') && <About />}
      </main>
    ) : page === 'mine' ? (
      <main><section style={{ paddingTop: 28 }}><div className="wrap" style={{ maxWidth: 760 }}>
        <button className="btn ghost" style={{ marginLeft: -12 }} onClick={() => window.history.back()}><ArrowLeft size={18} /> Back</button>
        <h2 style={{ fontSize: 'clamp(24px,4vw,32px)', margin: '4px 0 16px' }}>My orders &amp; bookings</h2>
        {user ? <MineView key={mine.k} tick={tick} initialTab={mine.tab} focus={mine.focus} />
          : <p className="muted">Please sign in to see your orders and bookings.</p>}
      </div></section></main>
    ) : (
      detail
        ? <PlantDetail key={detail.id} item={detail} kind={page === 'plants' ? 'plant' : 'material'} goHome={() => goHome()} goKind={() => goPage(page)} goCategory={c => goPage(page, c)} />
        : <CatalogPage key={page + ':' + catFilter} initialCategory={catFilter} openItem={openItem} kind={page === 'plants' ? 'plant' : 'material'} fallback={page === 'plants' ? cat.plants : cat.materials} goHome={() => goHome()} />
    )}
    <footer><div className="wrap"><div className="logo light">{brand?.logo ? <img src={brand.logo} alt="" style={{ height: 56, width: 'auto', maxWidth: 190, objectFit: 'contain' }} /> : <Leaf size={24} />}<span><b>{brandName}</b>{(brand ? brand.tagline : 'Grow to Green') ? <small>{brand ? brand.tagline : 'Grow to Green'}</small> : null}</span></div>
      <p>Coimbatore's trusted terrace &amp; balcony garden specialists</p><p className="copy">© {new Date().getFullYear()} {brandName}, Coimbatore. All rights reserved.</p></div></footer>
    {!modal && <SocialDock />}
    {user && !modal && <OrderFab count={cart.count} onClick={() => setModal({ t: 'order' })} />}
    {!modal && <ScrollTopButton />}
    {modal?.t === 'auth' && <AuthModal mode={modal.m} onClose={() => setModal(null)} toast={toast} />}
    {modal?.t === 'order' && user && <OrderPanel plants={cat.plants} materials={cat.materials} onClose={() => setModal(null)} toast={toast} openMine={() => goMine()} />}
    {modal?.t === 'notifs' && user && <NotificationsModal items={notif.items} markAllRead={notif.markAllRead} onClose={() => setModal(null)} onOpen={t => goMine(t.tab, t.focus)} />}
    {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
  </>
}
export default function App() { return <AuthProvider><CartProvider><Shell /></CartProvider></AuthProvider> }
