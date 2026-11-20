import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import { date, errMsg } from '../../utils/format';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');

  const load = () => adminAPI.users({ q: q || undefined, limit: 100 }).then((r) => setUsers(r.data.users)).catch(() => setUsers([]));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q]); // eslint-disable-line

  const toggle = async (u) => {
    try { await adminAPI.toggleUser(u._id); toast.success(u.isActive ? 'User deactivated' : 'User activated'); load(); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <>
      <input className="input max-w-xs mb-4" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      {users === null ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy-800/60 border-b border-navy-800/10"><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Role</th><th className="p-4">Joined</th><th className="p-4" /></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-navy-800/5">
                  <td className="p-4 font-semibold">{u.name}</td><td className="p-4">{u.email}</td><td className="p-4">{u.phone}</td>
                  <td className="p-4">{u.role}</td><td className="p-4">{date(u.createdAt)}</td>
                  <td className="p-4 text-right">{u.role !== 'admin' && <button onClick={() => toggle(u)} className={`text-xs font-bold ${u.isActive ? 'text-red-600' : 'text-green-700'}`}>{u.isActive ? 'Deactivate' : 'Activate'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
