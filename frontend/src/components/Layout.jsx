import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAuth from '../context/useAuth';
import api from '../services/api';

const Layout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [checkingProfile, setCheckingProfile] = useState(true);

  // ── Is the user on the profile-setup page? ──────────────────────────────
  const isCompleteProfilePage = location.pathname === '/complete-profile';

  useEffect(() => {
    const ensureProfile = async () => {
      if (!user || user.role === 'admin') {
        setCheckingProfile(false);
        return;
      }

      // Already on the setup page — no need to check or redirect
      if (isCompleteProfilePage) {
        setCheckingProfile(false);
        return;
      }

      try {
        await api.get('/employees/me');
        setCheckingProfile(false);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/complete-profile', { replace: true });
        } else {
          setCheckingProfile(false);
        }
      }
    };

    ensureProfile();
  }, [user, location.pathname, navigate]);

  // ── Loading spinner (identical to original) ─────────────────────────────
  if (loading || checkingProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-background-light)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: '#7c3aed',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── Complete-profile page: full-screen centered, NO sidebar or header ────
  if (isCompleteProfilePage) {
    return (
      <div
        className="min-h-screen overflow-y-auto py-12 px-4"
        style={{ background: 'var(--color-background-light)' }}
      >
        <Outlet />
      </div>
    );
  }

  // ── All other pages: normal layout ───────────────────────────────────────
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-background-light)' }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;