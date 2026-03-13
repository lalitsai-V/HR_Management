import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../services/api';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import Logo from '../components/Logo';

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

      // If the user does not yet have a filled-out employee profile, send them
      // to the profile completion page.
      if (data.role !== 'admin') {
        try {
          await api.get('/employees/me');
          navigate('/');
        } catch (err) {
          if (err.response?.status === 404) {
            navigate('/complete-profile');
          } else {
            navigate('/');
          }
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left — Blue Corporate Panel */}
      <div
        className="hidden lg:flex lg:w-[55%] flex-col justify-between p-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a56db 0%, #1e40af 40%, #1d4ed8 70%, #2563eb 100%)',
        }}
      >
        {/* Wave shape at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '180px' }}
        >
          <svg viewBox="0 0 1200 180" preserveAspectRatio="none" width="100%" height="100%">
            <path
              d="M0,80 C200,160 400,0 600,80 C800,160 1000,20 1200,80 L1200,180 L0,180 Z"
              fill="rgba(255,255,255,0.06)"
            />
            <path
              d="M0,110 C300,50 600,170 900,90 C1050,60 1150,130 1200,110 L1200,180 L0,180 Z"
              fill="rgba(255,255,255,0.04)"
            />
          </svg>
        </div>

        {/* Light orbs */}
        <div className="absolute top-[-60px] right-[-60px] w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[120px] left-[-40px] w-56 h-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />

        {/* Logo row */}
        <div className="relative flex items-center gap-3">
          <Logo size={40} />
          <div>
            <p className="text-white font-bold tracking-widest text-sm" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.18em' }}>
              VAISO VERSE
            </p>
            <p className="text-blue-200 text-xs tracking-[0.22em]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              TECHNOLOGY
            </p>
          </div>
        </div>

        {/* HR Illustration */}
        <div className="relative flex justify-center items-end" style={{ flex: 1 }}>
          <svg viewBox="0 0 520 340" width="100%" style={{ maxWidth: '480px' }} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Office background wall + window */}
            <rect x="30" y="20" width="460" height="280" rx="18" fill="rgba(255,255,255,0.07)" />
            <rect x="60" y="40" width="160" height="110" rx="8" fill="rgba(255,255,255,0.1)" />
            <rect x="65" y="45" width="150" height="100" rx="6" fill="rgba(30,80,180,0.35)" />
            {/* Window panes */}
            <line x1="140" y1="45" x2="140" y2="145" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <line x1="65" y1="95" x2="215" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            {/* Plant */}
            <rect x="58" y="220" width="18" height="40" rx="3" fill="rgba(255,255,255,0.15)" />
            <ellipse cx="67" cy="215" rx="20" ry="26" fill="#22c55e" opacity="0.7" />
            <ellipse cx="55" cy="225" rx="12" ry="16" fill="#16a34a" opacity="0.65" />
            <ellipse cx="80" cy="222" rx="13" ry="15" fill="#15803d" opacity="0.6" />

            {/* Desk */}
            <rect x="90" y="230" width="340" height="14" rx="4" fill="rgba(255,255,255,0.18)" />
            <rect x="105" y="244" width="12" height="50" rx="3" fill="rgba(255,255,255,0.12)" />
            <rect x="405" y="244" width="12" height="50" rx="3" fill="rgba(255,255,255,0.12)" />

            {/* Laptop on desk */}
            <rect x="130" y="195" width="100" height="65" rx="5" fill="rgba(255,255,255,0.18)" />
            <rect x="134" y="199" width="92" height="57" rx="3" fill="rgba(20,50,150,0.55)" />
            {/* Screen chart bars */}
            <rect x="145" y="230" width="10" height="20" rx="2" fill="#60a5fa" />
            <rect x="160" y="222" width="10" height="28" rx="2" fill="#93c5fd" />
            <rect x="175" y="215" width="10" height="35" rx="2" fill="#60a5fa" />
            <rect x="190" y="225" width="10" height="25" rx="2" fill="#bfdbfe" />
            {/* Laptop base */}
            <rect x="118" y="258" width="124" height="8" rx="4" fill="rgba(255,255,255,0.2)" />

            {/* Dashboard panel floating */}
            <rect x="260" y="80" width="190" height="140" rx="10" fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <rect x="272" y="92" width="166" height="12" rx="4" fill="rgba(255,255,255,0.25)" />
            {/* Mini dashboard items */}
            <rect x="272" y="112" width="70" height="40" rx="5" fill="rgba(96,165,250,0.3)" />
            <rect x="352" y="112" width="70" height="40" rx="5" fill="rgba(147,197,253,0.25)" />
            <rect x="272" y="160" width="150" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
            <rect x="272" y="172" width="120" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
            <rect x="272" y="184" width="135" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
            {/* Avatar icons in panel */}
            <circle cx="292" cy="132" r="12" fill="rgba(255,255,255,0.3)" />
            <circle cx="372" cy="132" r="12" fill="rgba(255,255,255,0.25)" />

            {/* Person 1 – seated (left) */}
            <circle cx="175" cy="155" r="22" fill="rgba(255,255,255,0.22)" />
            <rect x="153" y="178" width="44" height="55" rx="8" fill="rgba(30,64,175,0.6)" />
            <rect x="148" y="195" width="16" height="32" rx="5" fill="rgba(30,64,175,0.5)" />
            <rect x="198" y="195" width="16" height="32" rx="5" fill="rgba(30,64,175,0.5)" />

            {/* Person 2 – standing center (woman) */}
            <circle cx="295" cy="130" r="24" fill="rgba(255,255,255,0.25)" />
            <rect x="272" y="155" width="46" height="75" rx="8" fill="rgba(15,23,96,0.55)" />
            <rect x="260" y="170" width="18" height="45" rx="5" fill="rgba(15,23,96,0.45)" />
            <rect x="318" y="170" width="18" height="45" rx="5" fill="rgba(15,23,96,0.45)" />
            {/* Tablet in hand */}
            <rect x="312" y="185" width="28" height="20" rx="4" fill="rgba(255,255,255,0.25)" />

            {/* Person 3 – standing right */}
            <circle cx="400" cy="138" r="22" fill="rgba(255,255,255,0.2)" />
            <rect x="378" y="161" width="44" height="70" rx="8" fill="rgba(23,37,136,0.55)" />
            <rect x="366" y="175" width="16" height="40" rx="5" fill="rgba(23,37,136,0.45)" />
            <rect x="422" y="175" width="16" height="40" rx="5" fill="rgba(23,37,136,0.45)" />
          </svg>
        </div>

        {/* Bottom tagline */}
        <div className="relative">
          <p className="text-white text-xs font-medium tracking-widest uppercase mb-1" style={{ letterSpacing: '0.18em' }}>
            HR MANAGEMENT SYSTEM
          </p>
          <div className="w-12 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
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
            <Logo size={30} />
            <div>
              <p className="text-sm font-bold tracking-widest" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)', letterSpacing: '0.15em' }}>
                VAISO VERSE
              </p>
              <p className="text-xs tracking-widest" style={{ color: 'var(--color-text-muted-light)', letterSpacing: '0.2em' }}>
                TECHNOLOGY
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
            >
              Welcome back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-muted-light)' }}>
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-light)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={16}
                  style={{ color: 'var(--color-text-muted-light)' }}
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-light)' }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  size={16}
                  style={{ color: 'var(--color-text-muted-light)' }}
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