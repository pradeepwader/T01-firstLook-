import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productAPI, orderAPI } from '../services/api';
import { openCashfreeCheckout } from '../services/cashfree';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { inr, errMsg } from '../utils/format';

/** Checkout -> Create Pending Order -> Online Payment */
export default function Checkout() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { productAPI.get(slug).then((r) => setP(r.data.product)).catch(() => setP(false)); }, [slug]);

  if (p === null) return <Spinner full />;
  if (p === false) return <div className="container-t01 py-24 text-center">Product not found.</div>;

  const pay = async () => {
    setBusy(true);
    try {
      const { data } = await orderAPI.checkout(p._id);
      if (data.free) { toast.success('Added to your dashboard'); return navigate('/dashboard'); }
      if (data.mode === 'mock') return navigate(`/payment/mock?order_id=${data.orderId}`);
      await openCashfreeCheckout(data); // redirects to Cashfree
    } catch (err) {
      if (err.response?.data?.code === 'OWNED') { toast('You already own this product'); return navigate('/dashboard'); }
      toast.error(errMsg(err, err.message));
      setBusy(false);
    }
  };

  return (
    <div className="container-t01 py-12 max-w-2xl">
      <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>
      <div className="card p-6 space-y-4">
        <div className="flex justify-between gap-4">
          <div><p className="font-extrabold text-lg">{p.title}</p><p className="text-sm text-navy-800/60">{p.tagline}</p></div>
          <p className="text-xl font-extrabold">{inr(p.price)}</p>
        </div>
        <hr className="border-navy-800/10" />
        <div className="text-sm text-navy-800/70">
          <p>Billing to: <strong className="text-navy-800">{user.name}</strong> ({user.email})</p>
          <p>Mobile: {user.phone}</p>
        </div>
        <div className="flex justify-between font-extrabold text-lg"><span>Total</span><span>{inr(p.price)}</span></div>
        <button className="btn-primary w-full" disabled={busy} onClick={pay}>
          {busy ? 'Please wait...' : p.price === 0 ? 'Get for free' : `Pay ${inr(p.price)} securely`}
        </button>
        <p className="text-xs text-center text-navy-800/50">Pay with UPI, card or net banking via Cashfree. <Link to={`/products/${p.slug}`} className="underline">Back to product</Link></p>
      </div>
    </div>
  );
}
