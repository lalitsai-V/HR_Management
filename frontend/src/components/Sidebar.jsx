import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, LogOut, CalendarDays, FileText, ClipboardCheck, DollarSign, X } from 'lucide-react';
import useAuth from '../context/useAuth'; // ✅ FIXED: default import from useAuth.js
import api from '../services/api';
import Logo from './Logo';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  // ... rest existing state
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [profileImage, setProfileImage] = useState('');

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/employees/me');
        setProfileImage(data.profile_image || '');
      } catch {
        // ignore - user might not have a profile record yet
      }
    };

    if (user) loadProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Admin sees: Dashboard, Employees, Leave Approvals, Activity Logs
  // ── User sees:  Dashboard, Attendance, Apply Leave
  const navLinks = isAdmin
    ? [
        { name: 'Dashboard',        path: '/',                icon: LayoutDashboard },
        { name: 'Employees',        path: '/employees',       icon: Users           },
        { name: 'Admin Attendance', path: '/admin-attendance', icon: CalendarDays   },
        { name: 'Payroll',          path: '/admin-payroll',   icon: DollarSign      },
        { name: 'Leave Approvals',  path: '/leave-approval',  icon: ClipboardCheck  },
        { name: 'Activity Logs',    path: '/activity',        icon: Activity        },
      ]
    : [
        { name: 'Dashboard',   path: '/',            icon: LayoutDashboard },
        { name: 'Attendance',  path: '/attendance',  icon: CalendarDays    },
        { name: 'Apply Leave', path: '/apply-leave', icon: FileText        },
      ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-30 w-64 h-screen flex flex-col flex-shrink-0 transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
      style={{
        background: 'linear-gradient(180deg, #0b1120 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo & Close Button */}
      <div className="h-16 flex items-center justify-between px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <h1 className="text-lg font-bold text-white tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
            VisoVersa
          </h1>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-4"
          style={{ color: 'rgba(148,163,184,0.4)', fontFamily: 'DM Sans, sans-serif' }}>
          {isAdmin ? 'Admin Menu' : 'My Menu'}
        </p>

        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/'}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(79,70,229,0.12))',
                      boxShadow: 'inset 0 0 0 1px rgba(124,58,237,0.25)',
                      color: '#fff',
                    }
                  : { color: 'rgba(148,163,184,0.8)' }
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={isActive ? { background: 'rgba(124,58,237,0.28)' } : {}}>
                    <Icon size={17} style={{ color: isActive ? '#a78bfa' : 'inherit' }} />
                  </div>
                  <span className="text-sm font-medium flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {link.name}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a78bfa' }} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white uppercase flex-shrink-0"
            style={{ background: profileImage ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {profileImage ? (
              <img src={profileImage} alt={user?.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
              (user?.name?.charAt(0) || 'U')
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {user?.name}
            </p>
            <p className="text-xs capitalize truncate"
              style={{ color: 'rgba(148,163,184,0.6)', fontFamily: 'DM Sans, sans-serif' }}>
              {user?.role}
            </p>
          </div>
        </button>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: 'rgba(252,165,165,0.7)', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(252,165,165,0.7)'; }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <LogOut size={17} />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;