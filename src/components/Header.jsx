import { useState } from 'react'
import { Leaf, Menu, X, ShoppingBasket, ClipboardList, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
const LINKS = [['home', 'Home'], ['gallery', 'Gallery'], ['services', 'Services'], ['plants', 'Plants'], ['materials', 'Materials'],
  ['packages', 'Packages'], ['subscriptions', 'Subscriptions'], ['visit-booking', 'Book Visit'], ['about', 'About']]
export default function Header({ openAuth, openOrder, openMine, right }) {
  const { user, signOut } = useAuth(); const [open, setOpen] = useState(false)
  const actions = user ? <>
    <span className="greet">Hi, {user.name}</span>
    <button className="btn ghost" onClick={() => { setOpen(false); openOrder() }}><ShoppingBasket size={16} /> Order</button>
    <button className="btn ghost" onClick={() => { setOpen(false); openMine() }}><ClipboardList size={16} /> My Orders &amp; Bookings</button>
    <button className="btn ghost" onClick={() => { setOpen(false); signOut() }}><LogOut size={16} /> Sign out</button></> : <>
    <button className="btn ghost" onClick={() => { setOpen(false); openAuth('signin') }}>Sign in</button>
    <button className="btn primary" onClick={() => { setOpen(false); openAuth('register') }}>Register</button></>
  return (
    <header className="topbar">
      <div className="bar">
        <a href="#home" className="logo"><Leaf size={26} /><span><b>GTG Paradise</b><small>Grow to Green</small></span></a>
        <nav className="nav-desktop">{LINKS.map(([id, t]) => <a key={id} href={'#' + id}>{t}</a>)}</nav>
        <div className="actions-desktop">{actions}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {right}
          <button className="icon-btn burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <div className="drawer">{LINKS.map(([id, t]) => <a key={id} href={'#' + id} onClick={() => setOpen(false)}>{t}</a>)}<div className="drawer-actions">{actions}</div></div>}
    </header>
  )
}
