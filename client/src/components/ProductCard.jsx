import { Link } from 'react-router-dom';
import { inr, categoryLabel } from '../utils/format';

export default function ProductCard({ product: p }) {
  return (
    <Link to={`/products/${p.slug}`} className="card overflow-hidden flex flex-col hover:shadow-lift transition group">
      <div className="h-40 bg-sky-soft flex items-center justify-center overflow-hidden">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-300" />
        ) : (
          <span className="text-5xl font-extrabold text-navy-800/20">T01<span className="text-amber">.</span></span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="badge bg-mint text-navy-800 self-start mb-3">{categoryLabel(p.category)}</span>
        <h3 className="font-extrabold text-lg leading-snug">{p.title}</h3>
        <p className="text-sm text-navy-800/70 mt-1.5 line-clamp-2 flex-1">{p.tagline}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-xl font-extrabold ${p.price === 0 ? 'text-green-700' : ''}`}>{inr(p.price)}</span>
          {p.compareAtPrice > p.price && <span className="text-sm line-through text-navy-800/40">₹{p.compareAtPrice}</span>}
        </div>
      </div>
    </Link>
  );
}
