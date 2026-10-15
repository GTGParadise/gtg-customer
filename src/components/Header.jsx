import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Leaf, Menu, X, ClipboardList, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useScrollLock } from '../hooks/useScrollLock'

export default function Header({ openAuth, openMine, right, page = 'home', goPage = () => {}, goHome = () => {}, showPlants = true, showMaterials = true }) {
  const { user, signOut } = useAuth()
  const [show, setShow] = useState(false)   // drawer mounted
  const [open, setOpen] = useState(false)   // drawer slid in
  useScrollLock(open)

  const openMenu = () => { setShow(true); setTimeout(() => setOpen(true), 20) }
  const close = () => { setOpen(false); setTimeout(() => setShow(false), 300) }

  // [id, label, isSeparatePage]
  const top = [['home', 'Home'], ['gallery', 'Gallery'], ['services', 'Services'],
    ...(showPlants ? [['plants', 'Plants', true]] : []), ...(showMaterials ? [['materials', 'Materials', true]] : []),
    ['packages', 'Packages'], ['visit-booking', 'Book Visit']]
  const about = ['about', 'About']
  const nav = [...top, about]   // desktop bar

  const link = ([id, t, isPage]) => isPage
    ? <a key={id} href="#" aria-current={page === id ? 'page' : undefined}
        onClick={e => { e.preventDefault(); goPage(id) }}>{t}</a>
    : <a key={id} href={'#' + id} onClick={e => { if (page !== 'home') { e.preventDefault(); goHome(id === 'home' ? undefined : id) } }}>{t}</a>

  const actions = user ? <>
    <button className="btn ghost" onClick={openMine}><ClipboardList size={16} /> My Orders &amp; Bookings</button>
    <button className="btn ghost" onClick={signOut}><LogOut size={16} /> Sign out</button></> : <>
    <button className="btn ghost" onClick={() => openAuth('signin')}>Sign in</button>
    <button className="btn primary" onClick={() => openAuth('register')}>Register</button></>

  // ---- drawer (inline styles only) ----
  const item = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', boxSizing: 'border-box',
    padding: '14px 18px', color: '#1a2433', textDecoration: 'none', background: 'none', border: 'none',
    boxShadow: 'inset 0 -1px 0 #e6ece8', textAlign: 'left', cursor: 'pointer', font: 'inherit', fontSize: 16, fontWeight: 400 }
  const withIcon = (icon, text) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{icon}{text}</span>
  const dLink = ([id, t, isPage]) => isPage
    ? <a key={id} href="#" style={item} onClick={e => { e.preventDefault(); close(); goPage(id) }}>{t}<ChevronRight size={18} /></a>
    : <a key={id} href={'#' + id} style={item} onClick={e => { close(); if (page !== 'home') { e.preventDefault(); goHome(id === 'home' ? undefined : id) } }}>{t}</a>

  const drawer = show && createPortal(<>
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99998,
      opacity: open ? 1 : 0, transition: 'opacity .3s ease' }} />
    <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '50vw', minWidth: 230, maxWidth: 420, height: '100dvh',
      background: '#fff', zIndex: 99999, overflowY: 'auto', overscrollBehavior: 'contain', boxShadow: '-4px 0 16px rgba(0,0,0,.18)',
      transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .3s cubic-bezier(.22,.8,.3,1)', willChange: 'transform' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 10px 4px' }}>
        <button className="icon-btn" onClick={close} aria-label="Close menu"><X /></button>
      </div>
      {user && <div style={{ padding: '6px 18px 10px', fontSize: 14, fontWeight: 600, color: '#1f6b3a' }}>Hi, {user.name} 👋</div>}
      {top.map(dLink)}
      {user && <button style={item} onClick={() => { close(); openMine() }}>{withIcon(<ClipboardList size={18} />, 'My Orders & Bookings')}</button>}
      {dLink(about)}
      {user
        ? <button style={item} onClick={() => { close(); signOut() }}>{withIcon(<LogOut size={18} />, 'Sign out')}</button>
        : <>
            <button style={item} onClick={() => { close(); openAuth('signin') }}>Sign in</button>
            <button style={item} onClick={() => { close(); openAuth('register') }}>Register</button>
          </>}
    </aside>
  </>, document.body)

  return (
    <header className="topbar">
      <div className="bar">
        <a href="#home" className="logo" onClick={e => { if (page !== 'home') { e.preventDefault(); goHome() } }}><Leaf size={26} /><span><b>GTG Paradise</b><small>Grow to Green</small></span></a>
        <nav className="nav-desktop">{nav.map(n => link(n))}</nav>
        <div className="actions-desktop">{actions}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {right}
          <button className="icon-btn burger" onClick={openMenu} aria-label="Menu" aria-expanded={open}><Menu /></button>
        </div>
      </div>
      {user && <div style={{ padding: '4px 16px', fontSize: 14, fontWeight: 600, color: '#1f6b3a', background: '#f1f8f3', borderTop: '1px solid #e1eee5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hi, {user.name} 👋</div>}
      {drawer}
    </header>
  )
}
