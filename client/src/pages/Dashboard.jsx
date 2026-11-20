import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { libraryAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { date, inr, errMsg, categoryLabel } from '../utils/format';

const STATUS = { PAID: 'bg-green-100 text-green-800', PENDING: 'bg-amber/30 text-navy-800', FAILED: 'bg-red-100 text-red-800', CANCELLED: 'bg-gray-200 text-gray-700' };

/** User Dashboard -> Use Purchased Product */
export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('library');

  useEffect(() => {
    libraryAPI.list().then((r) => setItems(r.data.items)).catch(() => setItems([]));
    orderAPI.mine().then((r) => setOrders(r.data.orders)).catch(() => {});
  }, []);

  const open = async (productId) => {
    try {
      const { data } = await libraryAPI.open(productId);
      if (data.type === 'link') window.open(data.url, '_blank', 'noopener,noreferrer');
      else window.location.href = data.url; // authenticated file download
    } catch (err) { toast.error(errMsg(err, 'Could not open this product')); }
  };

  const tabBtn = (k, label) => (
    <button onClick={() => setTab(k)} className={`px-5 py-2 rounded-full text-sm font-bold ${tab === k ? 'bg-navy-800 text-white' : 'bg-white'}`}>{label}</button>
  );

  return (
    <div className="container-t01 py-12">
      <h1 className="text-3xl font-extrabold">Hi, {user.name.split(' ')[0]} 👋</h1>
      <p className="text-navy-800/70 mt-1">Your unlocked products and orders.</p>
      <div className="flex gap-2 mt-6">{tabBtn('library', 'My products')}{tabBtn('orders', 'Orders')}</div>

      {tab === 'library' && (items === null ? <Spinner /> : items.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <p className="mb-4">You have not unlocked anything yet.</p>
          <Link to="/products" className="btn-primary">Explore products</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {items.map(({ id, product, grantedAt }) => (
            <div key={id} className="card p-5 flex flex-col">
              <span className="badge bg-mint self-start">{categoryLabel(product.category)}</span>
              <h3 className="font-extrabold text-lg mt-3">{product.title}</h3>
              <p className="text-sm text-navy-800/60 mt-1 flex-1">Unlocked on {date(grantedAt)}</p>
              <button className="btn-primary mt-4" onClick={() => open(product._id)}>{product.deliveryType === 'file' ? 'Download' : 'Open'}</button>
            </div>
          ))}
        </div>
      ))}

      {tab === 'orders' && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy-800/60 border-b border-navy-800/10"><th className="p-4">Product</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th></tr></thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-navy-800/50">No orders yet.</td></tr>}
              {orders.map((o) => (
                <tr key={o.orderId} className="border-b border-navy-800/5">
                  <td className="p-4 font-semibold">{o.productTitle}</td><td className="p-4">{inr(o.amount)}</td>
                  <td className="p-4"><span className={`badge ${STATUS[o.status]}`}>{o.status}</span></td><td className="p-4">{date(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
