import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { contentAPI, productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const Tag = ({ children, light }) => (
  <span className={`section-tag ${light ? '!bg-amber !text-navy-900' : ''}`}>{children}</span>
);

export default function Home() {
  const [c, setC] = useState(null);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    contentAPI.get('home').then((r) => setC(r.data.data)).catch(() => setC(false));
    productAPI.list({ featured: true, limit: 3 }).then((r) => setFeatured(r.data.products)).catch(() => {});
  }, []);

  if (c === null) return <Spinner full />;
  if (c === false) return <div className="container-t01 py-24 text-center">Could not load the page. Please refresh.</div>;

  return (
    <>
      {/* HERO */}
      <section className="bg-navy-800 text-cream-soft">
        <div className="container-t01 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="h-1.5 w-20 rounded-full bg-amber mb-7" />
            <p className="text-amber font-bold text-sm tracking-wide uppercase mb-3">{c.hero.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">{c.hero.title}</h1>
            <p className="mt-5 text-cream-soft/75 text-lg max-w-lg">{c.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products?free=1" className="btn-primary">{c.hero.primaryCta}</Link>
              <Link to="/products" className="btn-outline">{c.hero.secondaryCta}</Link>
            </div>
          </div>
          <div className="bg-navy-700 rounded-[20px] p-6">
            <div className="bg-cream rounded-xl p-6 text-navy-800">
              <p className="text-xs font-bold uppercase text-navy-800/50">The reality</p>
              <p className="text-6xl font-extrabold mt-2">{c.stat.value}</p>
              <p className="font-semibold mt-1">{c.stat.label}</p>
              <p className="text-xs mt-3 text-navy-800/50">Source: {c.stat.source}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl bg-sky-brand h-24" />
              <div className="rounded-xl bg-amber h-24" />
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE JOURNEY */}
      <section className="py-16">
        <div className="container-t01">
          <Tag>Explore What We Offer</Tag>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/products" className="card p-7 hover:shadow-lift transition">
              <h3 className="text-xl font-extrabold">I want to explore products</h3>
              <p className="text-navy-800/70 mt-2">Go straight to roadmaps, guides and interview resources.</p>
              <span className="mt-5 inline-flex items-center gap-2 font-bold text-sky-brand">Browse products <FiArrowRight /></span>
            </Link>
            <a href="#problems" className="card p-7 hover:shadow-lift transition">
              <h3 className="text-xl font-extrabold">Help me understand the problem</h3>
              <p className="text-navy-800/70 mt-2">See why graduates struggle and how T01 solves it.</p>
              <span className="mt-5 inline-flex items-center gap-2 font-bold text-sky-brand">Understand more <FiArrowRight /></span>
            </a>
          </div>
        </div>
      </section>

      {/* PROBLEMS */}
      <section id="problems" className="pb-16">
        <div className="container-t01">
          <Tag>The Problem</Tag>
          <h2 className="text-3xl font-extrabold max-w-2xl mb-8">{c.problemsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {c.problems.map((p) => (
              <div key={p.title} className="card p-6 border-t-4 border-amber">
                <h3 className="font-extrabold text-lg">{p.title}</h3>
                <p className="mt-2 text-navy-800/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="pb-16">
        <div className="container-t01">
          <Tag>Our Solutions</Tag>
          <h2 className="text-3xl font-extrabold mb-8">{c.solutionsTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {c.solutions.map((s) => (
              <div key={s.title} className="card p-6">
                <div className="h-24 rounded-lg bg-mint mb-4 flex items-center justify-center text-navy-800/30"><FiCheckCircle size={36} /></div>
                <h3 className="font-extrabold text-lg">{s.title}</h3>
                <p className="mt-2 text-navy-800/70">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="pb-16">
          <div className="container-t01">
            <div className="flex items-end justify-between mb-6">
              <Tag>Featured Products</Tag>
              <Link to="/products" className="font-bold text-sky-brand text-sm mb-6">View all →</Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">{featured.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        </section>
      )}

      {/* WHY */}
      <section className="bg-navy-800 py-16 text-cream-soft">
        <div className="container-t01">
          <Tag light>Why Choose T01?</Tag>
          <div className="grid md:grid-cols-3 gap-6">
            {c.why.map((w) => (
              <div key={w.title} className="bg-navy-700 rounded-2xl p-6">
                <h3 className="font-extrabold text-lg text-amber">{w.title}</h3>
                <p className="mt-2 text-cream-soft/75">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container-t01 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">{c.cta.title}</h2>
          <Link to="/products" className="btn-primary">{c.cta.button}</Link>
        </div>
      </section>
    </>
  );
}
