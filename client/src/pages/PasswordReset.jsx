import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../utils/format';

const Box = ({ title, children }) => (
  <div className="container-t01 py-16 flex justify-center"><div className="card w-full max-w-md p-8"><h1 className="text-2xl font-extrabold mb-5">{title}</h1>{children}</div></div>
);

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    try { await authAPI.forgot(email); setSent(true); } catch (err) { toast.error(errMsg(err)); }
  };
  return (
    <Box title="Forgot password">
      {sent ? <p>If that email is registered, a reset link is on its way. <Link to="/login" className="text-sky-brand font-bold">Back to login</Link></p> : (
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button className="btn-primary w-full">Send reset link</button>
        </form>
      )}
    </Box>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAPI.reset(token, password);
      setUser(data.user);
      toast.success('Password updated');
      navigate('/dashboard');
    } catch (err) { toast.error(errMsg(err)); }
  };
  return (
    <Box title="Set a new password">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">New password</label><input className="input" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn-primary w-full">Update password</button>
      </form>
    </Box>
  );
}
