export const inr = (n) => (n === 0 ? 'Free' : `₹${Number(n).toLocaleString('en-IN')}`);
export const date = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const errMsg = (err, fallback = 'Something went wrong') => err?.response?.data?.message || fallback;
export const CATEGORIES = [
  ['roadmap', 'Roadmaps'], ['guide', 'Learning guides'], ['interview', 'Interview prep'],
  ['skills', 'Skills'], ['planning', 'Career planning'], ['other', 'Other'],
];
export const categoryLabel = (c) => CATEGORIES.find(([k]) => k === c)?.[1] || c;
