import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import Spinner from '../components/Spinner';
import { inr } from '../utils/format';

/** Payment Verified? Yes -> Confirm Order / No -> Payment Failed / Retry. Verification happens on the server. */
export default function PaymentStatus() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const tries = useRef(0);

  useEffect(() => {
    if (!orderId) { setError('Missing order reference.'); return undefined; }
    let stop = false;
    let timer;
    const check = async () => {
      try {
        const { data } = await orderAPI.status(orderId);
        if (stop) return;
        setOrder(data.order);
        // Gateway can lag a few seconds: keep checking while still pending
        if (data.order.status === 'PENDING' && tries.current++ < 6) timer = setTimeout(check, 3000);
      } catch (err) {
        if (!stop) setError(err.response?.data?.message || 'Could not verify payment.');
      }
    };
    check();
    return () => { stop = true; clearTimeout(timer); };
  }, [orderId]);

  if (error) return <div className="container-t01 py-24 text-center"><p className="mb-4">{error}</p><Link className="btn-dark" to="/dashboard">Go to dashboard</Link></div>;
  if (!order) return <Spinner full />;

  const view = {
    PAID: { icon: <FiCheckCircle className="text-green-600" size={56} />, title: 'Payment successful', text: 'Your order is confirmed and the product is unlocked.' },
    PENDING: { icon: <FiClock className="text-amber" size={56} />, title: 'Verifying payment...', text: 'We have not received confirmation yet. This page checks again automatically.' },
    FAILED: { icon: <FiXCircle className="text-red-600" size={56} />, title: 'Payment failed', text: order.failureReason || 'The payment could not be completed. You have not been charged for a failed attempt.' },
    CANCELLED: { icon: <FiXCircle className="text-red-600" size={56} />, title: 'Order cancelled', text: 'This order was replaced by a newer attempt.' },
  }[order.status];

  return (
    <div className="container-t01 py-16 flex justify-center">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="flex justify-center">{view.icon}</div>
        <h1 className="text-2xl font-extrabold mt-4">{view.title}</h1>
        <p className="text-navy-800/70 mt-2">{view.text}</p>
        <div className="bg-cream rounded-xl p-4 mt-6 text-sm text-left space-y-1">
          <p><span className="text-navy-800/60">Product:</span> <strong>{order.productTitle}</strong></p>
          <p><span className="text-navy-800/60">Amount:</span> <strong>{inr(order.amount)}</strong></p>
          <p className="break-all"><span className="text-navy-800/60">Order ID:</span> {order.orderId}</p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {order.status === 'PAID' && <button className="btn-primary" onClick={() => navigate('/dashboard')}>Open my dashboard</button>}
          {['FAILED', 'CANCELLED'].includes(order.status) && order.productSlug && <Link to={`/checkout/${order.productSlug}`} className="btn-primary">Retry payment</Link>}
          {order.status === 'PENDING' && <button className="btn-dark" onClick={() => window.location.reload()}>Check again</button>}
        </div>
      </div>
    </div>
  );
}
