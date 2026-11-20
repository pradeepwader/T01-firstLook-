import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import { date, inr, errMsg } from '../../utils/format';

const STATUS = { PAID: 'bg-green-100 text-green-800', PENDING: 'bg-amber/30', FAILED: 'bg-red-100 text-red-800', CANCELLED: 'bg-gray-200' };

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const load = () => adminAPI.orders({ status: status || undefined, q: q || undefined, limit: 100 }).then((r) => setOrders(r.data.orders)).catch(() => setOrders([]));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [status, q]); // eslint-disable-line

  const verify = async (id) => {
    try { const { data } = await adminAPI.verifyOrder(id); toast.success(`Status: ${data.status}`); load(); } catch (err) { toast.error(errMsg(err)); }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <select className="input max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['PAID', 'PENDING', 'FAILED', 'CANCELLED'].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="input max-w-xs" placeholder="Search order ID" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {orders === null ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy-800/60 border-b border-navy-800/10"><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Product</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4" /></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan="7" className="p-6 text-center text-navy-800/50">No orders.</td></tr>}
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-navy-800/5">
                  <td className="p-4 text-xs break-all max-w-[160px]">{o.orderId}</td>
                  <td className="p-4">{o.user?.name}<br /><span className="text-xs text-navy-800/50">{o.user?.email}</span></td>
                  <td className="p-4">{o.productTitle}</td><td className="p-4">{inr(o.amount)}</td>
                  <td className="p-4"><span className={`badge ${STATUS[o.status]}`}>{o.status}</span></td><td className="p-4">{date(o.createdAt)}</td>
                  <td className="p-4">{o.gateway === 'cashfree' && o.status !== 'PAID' && <button className="text-xs font-bold text-sky-brand" onClick={() => verify(o.orderId)}>Re-verify</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
