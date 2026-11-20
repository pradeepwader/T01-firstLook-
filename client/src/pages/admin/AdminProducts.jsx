import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import Spinner from '../../components/Spinner';
import { inr, errMsg, CATEGORIES } from '../../utils/format';

const EMPTY = { title: '', tagline: '', description: '', category: 'guide', price: 0, compareAtPrice: 0, features: '', deliveryType: 'link', externalUrl: '', isPublished: true, isFeatured: false };

export default function AdminProducts() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(null); // null = list view
  const [editingId, setEditingId] = useState(null);
  const [files, setFiles] = useState({});
  const [busy, setBusy] = useState(false);

  const load = () => adminAPI.products().then((r) => setItems(r.data.products)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const edit = (p) => {
    setEditingId(p?._id || null);
    setFiles({});
    setForm(p ? { ...EMPTY, ...p, features: (p.features || []).join('\n'), externalUrl: p.externalUrl || '' } : EMPTY);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      Object.keys(EMPTY).forEach((k) => fd.append(k, form[k] ?? ''));
      if (files.thumbnail) fd.append('thumbnail', files.thumbnail);
      if (files.file) fd.append('file', files.file);
      await adminAPI.saveProduct(editingId, fd);
      toast.success('Product saved');
      setForm(null);
      load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try { const { data } = await adminAPI.deleteProduct(p._id); toast.success(data.message); load(); } catch (err) { toast.error(errMsg(err)); }
  };

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });
  const check = (k) => ({ checked: !!form[k], onChange: (e) => setForm({ ...form, [k]: e.target.checked }) });

  if (form) {
    return (
      <form onSubmit={save} className="card p-6 space-y-4">
        <h2 className="text-xl font-extrabold">{editingId ? 'Edit product' : 'New product'}</h2>
        <div><label className="label">Title</label><input className="input" required {...bind('title')} /></div>
        <div><label className="label">Tagline</label><input className="input" maxLength={200} {...bind('tagline')} /></div>
        <div><label className="label">Description</label><textarea className="input" rows={5} {...bind('description')} /></div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="label">Category</label><select className="input" {...bind('category')}>{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="label">Price (₹, 0 = free)</label><input className="input" type="number" min="0" required {...bind('price')} /></div>
          <div><label className="label">Original price (₹)</label><input className="input" type="number" min="0" {...bind('compareAtPrice')} /></div>
        </div>
        <div><label className="label">Features (one per line)</label><textarea className="input" rows={4} {...bind('features')} /></div>
        <div><label className="label">Thumbnail image</label><input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, thumbnail: e.target.files[0] })} /></div>

        <div className="rounded-xl bg-cream p-4 space-y-3">
          <p className="font-bold text-sm">What the buyer receives after payment</p>
          <select className="input" {...bind('deliveryType')}><option value="link">A link (Drive / Notion / course page)</option><option value="file">A file upload (PDF, ZIP, DOCX...)</option></select>
          {form.deliveryType === 'link'
            ? <input className="input" type="url" placeholder="https://..." {...bind('externalUrl')} />
            : <div><input type="file" onChange={(e) => setFiles({ ...files, file: e.target.files[0] })} />{form.fileName && <p className="text-xs mt-1 text-navy-800/60">Current file: {form.fileName}</p>}</div>}
        </div>

        <div className="flex gap-6 text-sm font-semibold">
          <label className="flex items-center gap-2"><input type="checkbox" {...check('isPublished')} /> Published</label>
          <label className="flex items-center gap-2"><input type="checkbox" {...check('isFeatured')} /> Featured on home</label>
        </div>
        <div className="flex gap-3"><button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save product'}</button><button type="button" className="btn-outline-dark" onClick={() => setForm(null)}>Cancel</button></div>
      </form>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4"><p className="text-navy-800/60 text-sm">{items?.length ?? 0} products</p><button className="btn-primary" onClick={() => edit(null)}>+ New product</button></div>
      {items === null ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-navy-800/60 border-b border-navy-800/10"><th className="p-4">Title</th><th className="p-4">Price</th><th className="p-4">Sales</th><th className="p-4">Status</th><th className="p-4" /></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-b border-navy-800/5">
                  <td className="p-4 font-semibold">{p.title}</td><td className="p-4">{inr(p.price)}</td><td className="p-4">{p.salesCount}</td>
                  <td className="p-4">{p.isPublished ? 'Published' : 'Draft'}</td>
                  <td className="p-4 text-right whitespace-nowrap"><button className="text-xs font-bold text-sky-brand mr-4" onClick={() => edit(p)}>Edit</button><button className="text-xs font-bold text-red-600" onClick={() => remove(p)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
