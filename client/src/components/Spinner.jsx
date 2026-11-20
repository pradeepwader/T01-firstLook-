export default function Spinner({ full = false }) {
  const ring = <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-800 border-t-transparent" />;
  return full ? <div className="min-h-[60vh] flex items-center justify-center">{ring}</div> : <div className="py-10 flex justify-center">{ring}</div>;
}
