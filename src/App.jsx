import { useState, useCallback } from 'react'
import { Home as HomeIcon, Building2, Flower2, Trees, Scissors, Leaf } from 'lucide-react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useCatalog } from './hooks/useCatalog'
import { configured } from './lib/supabase'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import Home from './components/Home'
import { Gallery, Services, Plants, Materials, Packages, About } from './components/Sections'
import { BookVisit, Contact, PlanModal } from './components/Forms'
import { OrderModal, MineModal } from './components/Orders'
import { Subscriptions, PlanDetails, ContinueModal } from './components/Subscriptions'
const SERVICES = [
  { i: <HomeIcon />, t: 'Home Gardening', d: 'Plants, planters and care plans for home gardens and compounds.' },
  { i: <Building2 />, t: 'Terrace Gardening', d: 'Terrace garden design and setup with beds, drainage and plant selection.' },
  { i: <Flower2 />, t: 'Balcony Gardening', d: 'Space-saving balcony gardens with vertical and railing planters.' },
  { i: <Trees />, t: 'Landscaping', d: 'Landscape planning and installation for outdoor spaces.' },
  { i: <Scissors />, t: 'Garden Maintenance', d: 'Scheduled visits for pruning, feeding, pest care and plant replacement.' }]
function Shell() {
  const cat = useCatalog(), { user } = useAuth()
  const [modal, setModal] = useState(null), [plan, setPlan] = useState(null), [sel, setSel] = useState(null), [details, setDetails] = useState(null), [cont, setCont] = useState(null), [toastMsg, setToastMsg] = useState(''), [tick, setTick] = useState(0)
  const toast = useCallback(m => { setToastMsg(m); setTimeout(() => setToastMsg(''), 4000) }, [])
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
      {on('packages') && <Packages items={cat.packages} onPick={setPlan} />}
      {on('subscriptions') && <Subscriptions selected={sel} onSelect={setSel} onView={id => { setSel(id); setDetails(id) }} />}
      {on('booking') && <BookVisit slots={cat.slots} openAuth={openAuth} toast={toast} refresh={refresh} />}
      {on('about') && <About />}
      {on('contact') && <Contact contact={cat.contact} />}
    </main>
    <footer><div className="wrap"><div className="logo light"><Leaf size={24} /><span><b>GTG Paradise</b><small>Grow to Green</small></span></div>
      <p>Coimbatore's trusted terrace &amp; balcony garden specialists</p><p className="copy">© {new Date().getFullYear()} GTG Paradise, Coimbatore. All rights reserved.</p></div></footer>
    {modal?.t === 'auth' && <AuthModal mode={modal.m} onClose={() => setModal(null)} toast={toast} />}
    {modal?.t === 'order' && user && <OrderModal plants={cat.plants} materials={cat.materials} onClose={() => setModal(null)} toast={toast} openMine={() => setModal({ t: 'mine' })} />}
    {modal?.t === 'mine' && user && <MineModal onClose={() => setModal(null)} tick={tick} />}
    {details && <PlanDetails planId={details} onClose={() => setDetails(null)} onSwitch={id => { setDetails(id); setSel(id) }} onContinue={id => { setDetails(null); setCont(id) }} />}
    {cont && <ContinueModal planId={cont} onClose={() => setCont(null)} toast={toast} refresh={refresh} />}
    {plan && <PlanModal plan={plan} onClose={() => setPlan(null)} openAuth={openAuth} toast={toast} refresh={refresh} />}
    {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
  </>
}
export default function App() { return <AuthProvider><Shell /></AuthProvider> }
