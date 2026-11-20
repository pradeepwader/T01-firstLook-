import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productAPI, libraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { inr, categoryLabel } from '../utils/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    setP(null);
    productAPI.get(slug).then((r) => setP(r.data.product)).catch(() => setP(false));
  }, [slug]);

  useEffect(() => {
    if (!user || !p) return;
    libraryAPI.list().then((r) => setOwned(r.data.items.some((i) => i.product._id === p._id))).catch(() => {});
  }, [user, p]);

  if (p === null) return <Spinner full />;
  if (p === false) return <div className="container-t01 py-24 text-center">Product not found. <Link className="underline" to="/products">Back to products</Link></div>;

  // Click Buy Now -> Already registered? -> (Create account) -> Login -> Checkout
  const buy = () => {
    if (!user) {
      toast('Please log in or create an account to continue');
      return navigate('/login', { state: { from: `/checkout/${p.slug}` } });
    }
    navigate(`/checkout/${p.slug}`);
  };

  return (
    <div className="container-t01 py-12 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <Link to="/products" className="text-sm font-bold text-sky-brand">← All products</Link>
        <span className="badge bg-mint ml-3">{categoryLabel(p.category)}</span>
        <h1 className="text-3xl md:text-4xl font-extrabold mt-3">{p.title}</h1>
        <p className="text-lg text-navy-800/70 mt-2">{p.tagline}</p>
        <div className="mt-6 rounded-2xl overflow-hidden bg-sky-soft h-64 flex items-center justify-center">
          {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover" /> : <span className="text-7xl font-extrabold text-navy-800/15">T01<span className="text-amber">.</span></span>}
        </div>
        <h2 className="text-xl font-extrabold mt-8 mb-2">About this product</h2>
        <p className="whitespace-pre-line text-navy-800/80 leading-relaxed">{p.description}</p>
        {p.features?.length > 0 && (
          <>
            <h2 className="text-xl font-extrabold mt-8 mb-3">What you get</h2>
            <ul className="space-y-2">
              {p.features.map((f) => <li key={f} className="flex gap-3"><FiCheck className="text-green-700 mt-1 shrink-0" />{f}</li>)}
            </ul>
          </>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 h-fit card p-6">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold">{inr(p.price)}</span>
          {p.compareAtPrice > p.price && <span className="line-through text-navy-800/40">₹{p.compareAtPrice}</span>}
        </div>
        {owned ? (
          <Link to="/dashboard" className="btn-dark w-full mt-5">Already yours - open in dashboard</Link>
        ) : (
          <button onClick={buy} className="btn-primary w-full mt-5">{p.price === 0 ? 'Get it free' : 'Buy Now'}</button>
        )}
        <ul className="text-sm text-navy-800/70 mt-5 space-y-2">
          <li>✓ Instant access after payment</li>
          <li>✓ Pay via UPI, card or net banking</li>
          <li>✓ Secure payments by Cashfree</li>
        </ul>
      </aside>
    </div>
  );
}
