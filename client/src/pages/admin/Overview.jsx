import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import { inr, date } from '../../utils/format';

export default function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { adminAPI.stats().then((r) => setS(r.data.stats)).catch(() => setS(false)); }, []);
  if (s === null) return <Spinner />;
  if (s === false) return <p>Could not load stats.</p>;

  const cards = [['Revenue', inr(s.revenue)], ['Paid orders', s.paidOrders], ['Users', s.users], ['Products', s.products]];
  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([k, v]) => <div key={k} className="card p-5"><p className="text-sm text-navy-800/60">{k}</p><p className="text-2xl font-extrabold mt-1">{v}</p></div>)}
      </div>
      <h2 className="font-extrabold text-lg mt-8 mb-3">Recent orders</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-navy-800/60 border-b border-navy-800/10"><th className="p-4">Product</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th></tr></thead>
          <tbody>
            {s.recentOrders.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-navy-800/50">No orders yet.</td></tr>}
            {s.recentOrders.map((o) => (
              <tr key={o.orderId} className="border-b border-navy-800/5"><td className="p-4 font-semibold">{o.productTitle}</td><td className="p-4">{o.user?.name}</td><td className="p-4">{inr(o.amount)}</td><td className="p-4">{o.status}</td><td className="p-4">{date(o.createdAt)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
