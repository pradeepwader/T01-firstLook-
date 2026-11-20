import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-cream-soft/70">
      <div className="container-t01 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <Logo size="text-2xl" />
          <p className="text-sm mt-2 max-w-sm">Starting small. Building meaningful solutions for students and young people in India.</p>
        </div>
        <div className="flex gap-6 text-sm">
          <Link to="/products" className="hover:text-amber">Products</Link>
          <Link to="/about" className="hover:text-amber">About</Link>
          <Link to="/login" className="hover:text-amber">Login</Link>
        </div>
      </div>
      <div className="border-t border-navy-700 py-4 text-center text-xs">© {new Date().getFullYear()} Project T01. All rights reserved.</div>
    </footer>
  );
}
