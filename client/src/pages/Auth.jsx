import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../utils/format';

const Shell = ({ title, subtitle, children }) => (
  <div className="container-t01 py-16 flex justify-center">
    <div className="card w-full max-w-md p-8">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="text-navy-800/70 mt-1 mb-6">{subtitle}</p>
      {children}
    </div>
  </div>
);

const useAfterAuth = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  return { from: state?.from, go: (user) => navigate(state?.from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true }) };
};

export function Login() {
  const { user, login } = useAuth();
  const { from, go } = useAfterAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from || (user.role === 'admin' ? '/admin' : '/dashboard')} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { go(await login(f.email, f.password)); } catch (err) { toast.error(errMsg(err, 'Login failed')); } finally { setBusy(false); }
  };

  return (
    <Shell title="Welcome back" subtitle="Log in to continue.">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
      </form>
      <div className="flex justify-between text-sm mt-5">
        <Link to="/forgot-password" className="text-sky-brand font-semibold">Forgot password?</Link>
        <span>New here? <Link to="/register" state={{ from }} className="text-sky-brand font-bold">Create account</Link></span>
      </div>
    </Shell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const { from, go } = useAfterAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={from || (user.role === 'admin' ? '/admin' : '/dashboard')} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { go(await register(f)); } catch (err) { toast.error(errMsg(err, 'Could not create account')); } finally { setBusy(false); }
  };
  const bind = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });

  return (
    <Shell title="Create your account" subtitle="Takes less than a minute.">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Full name</label><input className="input" required {...bind('name')} /></div>
        <div><label className="label">Email</label><input className="input" type="email" required {...bind('email')} /></div>
        <div><label className="label">Mobile number</label><input className="input" inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" title="10-digit Indian mobile number" required placeholder="10-digit number (needed for payments)" {...bind('phone')} /></div>
        <div><label className="label">Password</label><input className="input" type="password" minLength={8} required placeholder="At least 8 characters" {...bind('password')} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="text-sm mt-5 text-center">Already registered? <Link to="/login" state={{ from }} className="text-sky-brand font-bold">Login</Link></p>
    </Shell>
  );
}
