import { useState, useCallback, useEffect } from 'react'
import { Home as HomeIcon, Building2, Flower2, Trees, Scissors, Leaf } from 'lucide-react'
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
import { MineModal } from './components/Orders'
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
  const goPage = (p, c = '') => { window.history.pushState({ page: p, cat: c }, ''); setPage(p); setCatFilter(c); setDetail(null); window.scrollTo(0, 0) }
  const openItem = item => { window.history.pushState({ page, cat: catFilter, item }, ''); setDetail(item); window.scrollTo(0, 0) }
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
    const h = e => { if (e.state?.order) return; setPage(e.state?.page || 'home'); setCatFilter(e.state?.cat || ''); setDetail(e.state?.item || null) }
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
  // Content published from the admin app (falls back to built-in content)
  const on = k => cat.site?.sections?.[k] !== false
  const brand = cat.site?.brand, brandName = brand?.name || 'GTG Paradise'
  useEffect(() => { document.title = brandName }, [brandName])
  const services = cat.site?.services?.length ? cat.site.services.map(s => ({ i: <Leaf />, t: s.title, d: s.description })) : SERVICES
  return <>
    <Header openAuth={openAuth} openMine={() => setModal({ t: 'mine' })}
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
    {modal?.t === 'order' && user && <OrderPanel plants={cat.plants} materials={cat.materials} onClose={() => setModal(null)} toast={toast} openMine={() => setModal({ t: 'mine' })} />}
    {modal?.t === 'mine' && user && <MineModal onClose={() => setModal(null)} tick={tick} />}
    {modal?.t === 'notifs' && user && <NotificationsModal items={notif.items} markAllRead={notif.markAllRead} onClose={() => setModal(null)} />}
    {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
  </>
}
export default function App() { return <AuthProvider><CartProvider><Shell /></CartProvider></AuthProvider> }
