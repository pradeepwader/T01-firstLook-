import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI, contentAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import { errMsg } from '../../utils/format';

const Field = ({ label, value, onChange, area }) => (
  <div><label className="label">{label}</label>{area ? <textarea className="input" rows={3} value={value} onChange={(e) => onChange(e.target.value)} /> : <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />}</div>
);

function Items({ title, items, onChange }) {
  const set = (i, k, v) => onChange(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-extrabold">{title}</h3>
      {items.map((it, i) => (
        <div key={i} className="grid gap-2 rounded-xl bg-cream p-3">
          <input className="input" placeholder="Title" value={it.title} onChange={(e) => set(i, 'title', e.target.value)} />
          <textarea className="input" rows={2} placeholder="Text" value={it.text} onChange={(e) => set(i, 'text', e.target.value)} />
          <button type="button" className="text-xs font-bold text-red-600 justify-self-end" onClick={() => onChange(items.filter((_, x) => x !== i))}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn-outline-dark !py-2" onClick={() => onChange([...items, { title: '', text: '' }])}>+ Add item</button>
    </div>
  );
}

/** Manage Landing Pages and Content */
export default function AdminContent() {
  const [c, setC] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { contentAPI.get('home').then((r) => setC(r.data.data)).catch(() => setC(false)); }, []);
  if (c === null) return <Spinner />;
  if (c === false) return <p>Could not load content.</p>;

  const up = (path, v) => setC((prev) => {
    const next = structuredClone(prev);
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((o, k) => o[k], next)[last] = v;
    return next;
  });

  const save = async () => {
    setBusy(true);
    try { await adminAPI.saveContent('home', c); toast.success('Landing page updated'); } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold">Hero</h3>
        <Field label="Eyebrow" value={c.hero.eyebrow} onChange={(v) => up('hero.eyebrow', v)} />
        <Field label="Headline" value={c.hero.title} onChange={(v) => up('hero.title', v)} />
        <Field label="Sub-headline" area value={c.hero.subtitle} onChange={(v) => up('hero.subtitle', v)} />
        <div className="grid sm:grid-cols-2 gap-4"><Field label="Primary button" value={c.hero.primaryCta} onChange={(v) => up('hero.primaryCta', v)} /><Field label="Secondary button" value={c.hero.secondaryCta} onChange={(v) => up('hero.secondaryCta', v)} /></div>
      </div>
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold">Statistic</h3>
        <div className="grid sm:grid-cols-3 gap-4"><Field label="Value" value={c.stat.value} onChange={(v) => up('stat.value', v)} /><Field label="Label" value={c.stat.label} onChange={(v) => up('stat.label', v)} /><Field label="Source" value={c.stat.source} onChange={(v) => up('stat.source', v)} /></div>
      </div>
      <Field label="Problems heading" value={c.problemsTitle} onChange={(v) => up('problemsTitle', v)} />
      <Items title="Problems" items={c.problems} onChange={(v) => up('problems', v)} />
      <Field label="Solutions heading" value={c.solutionsTitle} onChange={(v) => up('solutionsTitle', v)} />
      <Items title="Solutions" items={c.solutions} onChange={(v) => up('solutions', v)} />
      <Items title="Why choose T01" items={c.why} onChange={(v) => up('why', v)} />
      <div className="card p-5 space-y-4">
        <h3 className="font-extrabold">Call to action</h3>
        <div className="grid sm:grid-cols-2 gap-4"><Field label="Title" value={c.cta.title} onChange={(v) => up('cta.title', v)} /><Field label="Button" value={c.cta.button} onChange={(v) => up('cta.button', v)} /></div>
      </div>
      <Field label="About page text" area value={c.about} onChange={(v) => up('about', v)} />
      <button className="btn-primary" disabled={busy} onClick={save}>{busy ? 'Saving...' : 'Save changes'}</button>
    </div>
  );
}
