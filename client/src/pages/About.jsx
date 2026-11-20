import { useEffect, useState } from 'react';
import { contentAPI } from '../services/api';

export default function About() {
  const [about, setAbout] = useState('');
  useEffect(() => { contentAPI.get('home').then((r) => setAbout(r.data.data.about)).catch(() => {}); }, []);
  return (
    <div className="container-t01 py-16 max-w-3xl">
      <span className="section-tag">About T01</span>
      <h1 className="text-4xl font-extrabold mb-6">Starting small. Building meaningful solutions.</h1>
      <p className="text-lg text-navy-800/80 leading-relaxed">{about}</p>
      <div className="grid sm:grid-cols-2 gap-6 mt-10">
        <div className="card p-6"><h3 className="font-extrabold text-lg">Phase 1 - Validate</h3><p className="mt-2 text-navy-800/70">Affordable digital products - roadmaps, guides and interview resources - to learn what people truly need.</p></div>
        <div className="card p-6"><h3 className="font-extrabold text-lg">Phase 2 - Expand</h3><p className="mt-2 text-navy-800/70">Advanced learning systems, structured career programs and personalised guidance.</p></div>
      </div>
    </div>
  );
}
