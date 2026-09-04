import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/watchlist');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 groww-card space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#00d09c]/15 border border-[#00d09c]/30 text-[#00d09c] text-2xl flex items-center justify-center mx-auto shadow-inner">
          🌱
        </div>
        <h2 className="text-2xl font-black text-slate-900">Create Groww Account</h2>
        <p className="text-xs text-slate-500 font-medium">Start tracking intelligent market changes</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-[#00d09c] rounded-xl text-slate-900 outline-none text-sm font-medium transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-[#00d09c] rounded-xl text-slate-900 outline-none text-sm font-medium transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 focus:border-[#00d09c] rounded-xl text-slate-900 outline-none text-sm font-medium transition-all"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 btn-groww text-sm font-black disabled:opacity-50 mt-2"
        >
          {loading ? 'Creating Account…' : 'Register Account'}
        </button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-500 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-[#00d09c] font-bold hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
