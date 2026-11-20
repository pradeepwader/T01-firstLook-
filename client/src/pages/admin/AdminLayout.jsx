import { NavLink, Outlet } from 'react-router-dom';

const links = [['/admin', 'Overview', true], ['/admin/products', 'Products'], ['/admin/orders', 'Orders & Payments'], ['/admin/users', 'Users'], ['/admin/content', 'Landing Content']];

export default function AdminLayout() {
  return (
    <div className="container-t01 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Admin Dashboard</h1>
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-2 overflow-x-auto">
          {links.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap ${isActive ? 'bg-navy-800 text-white' : 'bg-white hover:bg-sky-soft'}`}>{label}</NavLink>
          ))}
        </nav>
        <section className="min-w-0"><Outlet /></section>
      </div>
    </div>
  );
}
