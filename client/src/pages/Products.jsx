import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { CATEGORIES } from '../utils/format';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState(params.get('q') || '');
  const category = params.get('category') || '';
  const freeOnly = params.get('free') === '1';

  useEffect(() => {
    const t = setTimeout(() => {
      setItems(null);
      productAPI.list({ category: category || undefined, q: q || undefined, limit: 60 })
        .then((r) => setItems(r.data.products))
        .catch(() => setItems([]));
    }, 250);
    return () => clearTimeout(t);
  }, [category, q]);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };

  const shown = items && (freeOnly ? items.filter((p) => p.price === 0) : items);
  const chip = (active) => `px-4 py-2 rounded-full text-sm font-bold transition ${active ? 'bg-navy-800 text-white' : 'bg-white text-navy-800 hover:bg-sky-soft'}`;

  return (
    <div className="container-t01 py-12">
      <h1 className="text-3xl md:text-4xl font-extrabold">Explore Products</h1>
      <p className="text-navy-800/70 mt-2">Practical resources to help you learn, prepare and grow.</p>

      <div className="mt-8 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button className={chip(!category && !freeOnly)} onClick={() => setParams({}, { replace: true })}>All</button>
          <button className={chip(freeOnly)} onClick={() => setParams({ free: '1' }, { replace: true })}>Free</button>
          {CATEGORIES.slice(0, 5).map(([k, label]) => (
            <button key={k} className={chip(category === k)} onClick={() => set('category', category === k ? '' : k)}>{label}</button>
          ))}
        </div>
        <input className="input md:max-w-xs" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {shown === null ? <Spinner /> : shown.length === 0 ? (
        <p className="py-20 text-center text-navy-800/60">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">{shown.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </div>
  );
}
