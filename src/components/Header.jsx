import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Leaf, Menu, X, LogOut, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useScrollLock } from '../hooks/useScrollLock'

const greeting = () => {
  const h = new Date().getHours()
  return h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : h >= 17 && h < 21 ? 'Good evening' : 'Good night'
}

export default function Header({ openAuth, openMine, right, page = 'home', goPage = () => {}, goHome = () => {},
  showPlants = true, showMaterials = true, plantCats = [], materialCats = [], brand }) {
  const { user, signOut } = useAuth()
  const [show, setShow] = useState(false)   // drawer mounted
  const [open, setOpen] = useState(false)   // drawer slid in
  const [view, setView] = useState('main')  // 'main' | 'plants' | 'materials'
  useScrollLock(open)

  const openMenu = () => { setView('main'); setShow(true); setTimeout(() => setOpen(true), 20) }
  const close = () => { setOpen(false); setTimeout(() => { setShow(false); setView('main') }, 300) }
  useEffect(() => {   // lets the Plants/Materials page open this menu
    window.addEventListener('gtg:open-menu', openMenu)
    return () => window.removeEventListener('gtg:open-menu', openMenu)
  }, [])

  // [id, label, isSeparatePage]
  const top = [['home', 'Home'], ['gallery', 'Gallery'], ['services', 'Services'],
    ...(showPlants ? [['plants', 'Plants', true]] : []), ...(showMaterials ? [['materials', 'Materials', true]] : []),
    ['subscriptions', 'Plans'], ['packages', 'Packages'], ['visit-booking', 'Book Visit']]
  const about = ['about', 'About']
  const nav = [...top, about]   // desktop bar

  const link = ([id, t, isPage]) => isPage
    ? <a key={id} href="#" aria-current={page === id ? 'page' : undefined} onClick={e => { e.preventDefault(); goPage(id) }}>{t}</a>
    : <a key={id} href={'#' + id} onClick={e => { if (page !== 'home') { e.preventDefault(); goHome(id === 'home' ? undefined : id) } }}>{t}</a>

  const actions = user ? <>
    <button className="btn ghost" onClick={openMine}>My Orders &amp; Bookings</button>
    <button className="btn ghost" onClick={signOut}><LogOut size={16} /> Sign out</button></> : <>
    <button className="btn ghost" onClick={() => openAuth('signin')}>Sign in</button>
    <button className="btn primary" onClick={() => openAuth('register')}>Register</button></>

  // ---- drawer (inline styles only) ----
  const item = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', boxSizing: 'border-box',
    padding: '14px 18px', color: '#1a2433', textDecoration: 'none', background: 'none', border: 'none',
    boxShadow: 'inset 0 -1px 0 #e6ece8', textAlign: 'left', cursor: 'pointer', font: 'inherit', fontSize: 16, fontWeight: 400 }
  const sub = { ...item, padding: '12px 18px', fontSize: 15 }
  const dLink = ([id, t, isPage]) => {
    if (isPage) return <button key={id} style={item} onClick={() => setView(id)}>{t}<ChevronRight size={18} /></button>
    return <a key={id} href={'#' + id} style={item} onClick={e => { close(); if (page !== 'home') { e.preventDefault(); goHome(id === 'home' ? undefined : id) } }}>{t}</a>
  }

  const isSub = view !== 'main'
  const label = view === 'plants' ? 'Plants' : 'Materials'
  const cats = view === 'plants' ? plantCats : materialCats

  const drawer = show && createPortal(<>
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 99998, opacity: open ? 1 : 0, transition: 'opacity .3s ease' }} />
    <aside style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '50vw', minWidth: 250, maxWidth: 420, height: '100dvh',
      background: '#fff', zIndex: 99999, overflowY: 'auto', overscrollBehavior: 'contain', boxShadow: '-4px 0 16px rgba(0,0,0,.18)',
      transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .3s cubic-bezier(.22,.8,.3,1)', willChange: 'transform' }}>

      {/* top row: Menu title + close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 12px 18px', borderBottom: '1px solid #e6ece8' }}>
        <b style={{ fontSize: 16, color: '#1f6b3a' }}>Menu</b>
        <button className="icon-btn" onClick={close} aria-label="Close menu"><X /></button>
      </div>

      {!isSub ? <>
        {user && <div style={{ padding: '14px 18px', background: '#f1f8f3', borderBottom: '1px solid #e1eee5' }}>
          <div style={{ fontSize: 13, color: '#5b6b60' }}>{greeting()},</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f6b3a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name} 👋</div>
        </div>}
        {top.map(dLink)}
        {user && <button style={item} onClick={() => { close(); openMine() }}>My Orders &amp; Bookings</button>}
        {dLink(about)}
        {user
          ? <button style={{ ...item, color: '#c62828', fontWeight: 600 }} onClick={() => { close(); signOut() }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><LogOut size={18} />Sign out</span></button>
          : <>
              <button style={item} onClick={() => { close(); openAuth('signin') }}>Sign in</button>
              <button style={item} onClick={() => { close(); openAuth('register') }}>Register</button>
            </>}
      </> : <>
        {/* sub menu: back + category list */}
        <button style={{ ...item, justifyContent: 'flex-start', color: '#1f6b3a', fontWeight: 600 }} onClick={() => setView('main')}>
          <ArrowLeft size={18} />{label}</button>
        <button style={{ ...sub, fontWeight: 600 }} onClick={() => { close(); goPage(view) }}>All {label.toLowerCase()}</button>
        {cats.map(c => <button key={c} style={sub} onClick={() => { close(); goPage(view, c) }}>{c}</button>)}
      </>}
    </aside>
  </>, document.body)

  return (
    <header className="topbar">
      <div className="bar">
        <a href="#home" className="logo" onClick={e => { if (page !== 'home') { e.preventDefault(); goHome() } }}>{brand?.logo ? <img src={brand.logo} alt="" style={{ height: 56, width: 'auto', maxWidth: 190, objectFit: 'contain' }} /> : <Leaf size={26} />}<span><b>{brand?.name || 'GTG Paradise'}</b>{(brand ? brand.tagline : 'Grow to Green') ? <small>{brand ? brand.tagline : 'Grow to Green'}</small> : null}</span></a>
        <nav className="nav-desktop">{nav.map(n => link(n))}</nav>
        <div className="actions-desktop">{actions}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {right}
          <button className="icon-btn burger" onClick={openMenu} aria-label="Menu" aria-expanded={open}><Menu /></button>
        </div>
      </div>
      {drawer}
    </header>
  )
}
