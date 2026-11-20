import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export const Logo = ({ size = 'text-3xl' }) => (
  <span className={`${size} font-extrabold text-cream-soft`}>T01<span className="text-amber">.</span></span>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const link = ({ isActive }) => `text-sm ${isActive ? 'text-amber' : 'text-cream-soft hover:text-amber'} transition`;
  const close = () => setOpen(false);

  return (
    <header className="bg-navy-900 sticky top-0 z-40">
      <div className="container-t01 flex items-center justify-between min-h-[72px]">
        <Link to="/" onClick={close}><Logo /></Link>

        <nav className="hidden md:flex items-center gap-9">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/products" className={link}>Products</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
          {user && <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className={link}>{user.role === 'admin' ? 'Admin' : 'My Dashboard'}</NavLink>}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button className="btn-primary" onClick={async () => { await logout(); navigate('/'); }}>Logout</button>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>

        <button className="md:hidden text-cream-soft" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-navy-900 border-t border-navy-700 px-5 pb-5 flex flex-col gap-4 pt-4" onClick={close}>
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/products" className={link}>Products</NavLink>
          <NavLink to="/about" className={link}>About</NavLink>
          {user && <NavLink to={user.role === 'admin' ? '/admin' : '/dashboard'} className={link}>Dashboard</NavLink>}
          {user ? <button className="btn-primary" onClick={logout}>Logout</button> : <Link to="/login" className="btn-primary">Login</Link>}
        </div>
      )}
    </header>
  );
}
