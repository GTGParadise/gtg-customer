import { useState } from 'react'
import { Leaf, Menu, X, ShoppingBasket, ClipboardList, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useScrollLock } from '../hooks/useScrollLock'

export default function Header({ openAuth, openOrder, openMine, right, page = 'home', goPage = () => {}, goHome = () => {}, showPlants = true, showMaterials = true }) {
  const { user, signOut } = useAuth(); const [open, setOpen] = useState(false)
  useScrollLock(open)   // freezes the page behind the menu without hiding the top bar

  // [id, label, isSeparatePage]
  const nav = [['home', 'Home'], ['gallery', 'Gallery'], ['services', 'Services'],
    ...(showPlants ? [['plants', 'Plants', true]] : []), ...(showMaterials ? [['materials', 'Materials', true]] : []),
    ['visit-booking', 'Book Visit'], ['about', 'About']]

  const link = ([id, t, isPage], drawer) => isPage
    ? <a key={id} href="#" aria-current={page === id ? 'page' : undefined}
        style={drawer ? { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } : undefined}
        onClick={e => { e.preventDefault(); setOpen(false); goPage(id) }}>{t}{drawer && <ChevronRight size={18} />}</a>
    : <a key={id} href={'#' + id} onClick={e => { setOpen(false); if (page !== 'home') { e.preventDefault(); goHome(id === 'home' ? undefined : id) } }}>{t}</a>

  const actions = user ? <>
    <button className="btn ghost" onClick={() => { setOpen(false); openOrder() }}><ShoppingBasket size={16} /> Order</button>
    <button className="btn ghost" onClick={() => { setOpen(false); openMine() }}><ClipboardList size={16} /> My Orders &amp; Bookings</button>
    <button className="btn ghost" onClick={() => { setOpen(false); signOut() }}><LogOut size={16} /> Sign out</button></> : <>
    <button className="btn ghost" onClick={() => { setOpen(false); openAuth('signin') }}>Sign in</button>
    <button className="btn primary" onClick={() => { setOpen(false); openAuth('register') }}>Register</button></>
  return (
    <header className="topbar">
      <div className="bar">
        <a href="#home" className="logo" onClick={e => { if (page !== 'home') { e.preventDefault(); goHome() } }}><Leaf size={26} /><span><b>GTG Paradise</b><small>Grow to Green</small></span></a>
        <nav className="nav-desktop">{nav.map(n => link(n, false))}</nav>
        <div className="actions-desktop">{actions}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {right}
          <button className="icon-btn burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {user && <div style={{ padding: '4px 16px', fontSize: 14, fontWeight: 600, color: '#1f6b3a', background: '#f1f8f3', borderTop: '1px solid #e1eee5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hi, {user.name} 👋</div>}
      {open && <div className="drawer" style={{ maxHeight: 'calc(100dvh - 130px)', overflowY: 'auto', overscrollBehavior: 'contain' }}>
        {nav.map(n => link(n, true))}
        <div className="drawer-actions">{actions}</div></div>}
    </header>
  )
}
