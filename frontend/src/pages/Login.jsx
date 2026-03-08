import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Zap, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left — Decorative Panel */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1040 50%, #0f172a 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Grid dots */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span
            className="text-xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            VisoVersa
          </span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-5">
          <h2
            className="text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Manage your team <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              with confidence.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            A unified platform for tracking employees, monitoring activity, and managing your organization.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 pt-2">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '10k+', label: 'Users' },
              { value: 'SOC2', label: 'Compliant' },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div
          className="relative p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-slate-300 text-sm leading-relaxed italic">
            "VisoVersa transformed how we handle HR. Everything is in one place."
          </p>
          <p className="text-slate-500 text-xs mt-3">— Head of People Ops</p>
        </div>
      </div>

      {/* Right — Form */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: 'var(--color-background-light)' }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}
            >
              VisoVersa
            </span>
          </div>

          <div className="mb-8">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}
            >
              Welcome back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#64748b' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={16}
                  style={{ color: '#94a3b8' }}
                />
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={16}
                  style={{ color: '#94a3b8' }}
                />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-2"
              style={{ height: '44px' }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#64748b' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#7c3aed' }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;