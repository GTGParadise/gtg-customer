import { useState, useCallback } from 'react'
import { Home as HomeIcon, Building2, Flower2, Trees, Scissors, Leaf, Bell } from 'lucide-react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useCatalog } from './hooks/useCatalog'
import { useNotifications } from './hooks/useNotifications'
import { configured } from './lib/supabase'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import Home from './components/Home'
import { Gallery } from './components/Sections'
import About from './components/About'
import { Plants } from './components/Plants'
import { Materials } from './components/Materials'
import { Plans } from './components/Plans'
import { Services } from './components/Services'
import { BookVisit } from './components/Forms'
import { OrderModal, MineModal } from './components/Orders'
import NotificationsModal from './components/NotificationsModal'
const SERVICES = [
  { i: <HomeIcon />, t: 'Home Gardening', d: 'Plants, planters and care plans for home gardens and compounds.' },
  { i: <Building2 />, t: 'Terrace Gardening', d: 'Terrace garden design and setup with beds, drainage and plant selection.' },
  { i: <Flower2 />, t: 'Balcony Gardening', d: 'Space-saving balcony gardens with vertical and railing planters.' },
  { i: <Trees />, t: 'Landscaping', d: 'Landscape planning and installation for outdoor spaces.' },
  { i: <Scissors />, t: 'Garden Maintenance', d: 'Scheduled visits for pruning, feeding, pest care and plant replacement.' }]
function Shell() {
  const cat = useCatalog(), { user } = useAuth()
  const [modal, setModal] = useState(null), [toastMsg, setToastMsg] = useState(''), [tick, setTick] = useState(0)
  const toast = useCallback(m => { setToastMsg(m); setTimeout(() => setToastMsg(''), 4000) }, [])
  const notif = useNotifications(toast)
  const openAuth = m => setModal({ t: 'auth', m })
  const guard = fn => () => (user ? fn() : (toast('Please sign in first.'), openAuth('signin')))
  const refresh = () => setTick(t => t + 1)
  // Content published from the admin app (falls back to built-in content)
  const on = k => cat.site?.sections?.[k] !== false
  const services = cat.site?.services?.length ? cat.site.services.map(s => ({ i: <Leaf />, t: s.title, d: s.description })) : SERVICES
  return <>
    <Header openAuth={openAuth} openOrder={() => setModal({ t: 'order' })} openMine={() => setModal({ t: 'mine' })} />
    {!configured && <div className="banner">Backend not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Showing built-in content; sign-in, orders and bookings are disabled.</div>}
    {cat.status === 'error' && <div className="banner">Could not load live data. Showing built-in content.</div>}
    <main>
      {on('hero') && <Home image={cat.site?.heroImage} />}
      {on('gallery') && <Gallery />}
      {on('services') && <Services items={services} />}
      {on('plants') && <Plants items={cat.plants} onOrder={guard(() => setModal({ t: 'order' }))} />}
      {on('materials') && <Materials items={cat.materials} onOrder={guard(() => setModal({ t: 'order' }))} />}
      {(on('packages') || on('subscriptions')) && <Plans openAuth={openAuth} toast={toast} refresh={refresh} />}
      {on('booking') && <BookVisit slots={cat.slots} openAuth={openAuth} toast={toast} refresh={refresh} />}
      {on('about') && <About />}
    </main>
    <footer><div className="wrap"><div className="logo light"><Leaf size={24} /><span><b>GTG Paradise</b><small>Grow to Green</small></span></div>
      <p>Coimbatore's trusted terrace &amp; balcony garden specialists</p><p className="copy">© {new Date().getFullYear()} GTG Paradise, Coimbatore. All rights reserved.</p></div></footer>
    {user && (
      <button onClick={() => setModal({ t: 'notifs' })} aria-label="Notifications"
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 900, width: 52, height: 52, borderRadius: '50%', border: 0, background: '#1f6b3a', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>
        <Bell size={22} />
        {notif.unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: '#e53935', color: '#fff', fontSize: 12, lineHeight: '20px' }}>{notif.unread}</span>}
      </button>
    )}
    {modal?.t === 'auth' && <AuthModal mode={modal.m} onClose={() => setModal(null)} toast={toast} />}
    {modal?.t === 'order' && user && <OrderModal plants={cat.plants} materials={cat.materials} onClose={() => setModal(null)} toast={toast} openMine={() => setModal({ t: 'mine' })} />}
    {modal?.t === 'mine' && user && <MineModal onClose={() => setModal(null)} tick={tick} />}
    {modal?.t === 'notifs' && user && <NotificationsModal items={notif.items} markAllRead={notif.markAllRead} onClose={() => setModal(null)} />}
    {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
  </>
}
export default function App() { return <AuthProvider><Shell /></AuthProvider> }
