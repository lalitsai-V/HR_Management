
import React, { useMemo, useEffect, useState } from 'react';
import {
  Users, Building2, UserPlus, TrendingUp, RefreshCw,
  Mail, Phone, Briefcase, IdCard, User, Calendar, Award,
} from 'lucide-react';
import useAuth from '../context/useAuth';
import useEmployees from '../context/useEmployees';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#7c3aed', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'];

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN STAT CARD
──────────────────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, title, value, trend, accent, accentBg }) => (
  <div
    className="card p-5 relative overflow-hidden group transition-all duration-200 cursor-default"
    style={{ '--accent': accent }}
  >
    <div
      className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `radial-gradient(circle, ${accent}30, transparent 70%)` }}
    />
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: accentBg }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${accent}, transparent)`, opacity: 0.4 }} />
    </div>
    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted-light)' }}>{title}</p>
    <div className="text-3xl font-bold mb-1.5" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
      {value}
    </div>
    <p className="text-xs" style={{ color: '#94a3b8' }}>{trend}</p>
  </div>
);

/* ────────────────────────────────────────────────────────────────────────────
   ADMIN DASHBOARD
──────────────────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { employees, loading, refreshEmployees } = useEmployees();

  const stats = useMemo(() => {
    if (!employees || employees.length === 0) {
      return { totalEmployees: 0, totalCompanies: 0, recentAdded: 0, activeEmployees: 0 };
    }
    const companies = new Set(employees.map((emp) => emp.company));
    const activeCount = employees.filter((emp) => emp.status === 'Active').length;
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCount = employees.filter((emp) => new Date(emp.created_at) > last7Days).length;
    return {
      totalEmployees: employees.length,
      totalCompanies: companies.size,
      activeEmployees: activeCount,
      recentAdded: recentCount,
    };
  }, [employees]);

  const companyData = useMemo(() => {
    const counts = {};
    employees.forEach((emp) => { counts[emp.company] = (counts[emp.company] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [employees]);

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full"
              style={{ background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
        <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}`}</style>
      </div>
    );
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-7" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted-light)' }}>
            Here's what's happening with your team today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refreshEmployees}
            title="Refresh data"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7c3aed' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#7c3aed' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7c3aed', animation: 'pulse 2s infinite' }} />
            Live data
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users}    title="Total Employees" value={stats.totalEmployees}  trend="+12% from last month"  accent="#7c3aed" accentBg="rgba(124,58,237,0.08)"  />
        <StatCard icon={Building2} title="Departments"     value={stats.totalCompanies}  trend="Across all teams"     accent="#4f46e5" accentBg="rgba(79,70,229,0.08)"   />
        <StatCard icon={TrendingUp} title="Active"         value={stats.activeEmployees} trend="Currently working"    accent="#10b981" accentBg="rgba(16,185,129,0.08)"  />
        <StatCard icon={UserPlus}  title="Recently Added"  value={stats.recentAdded}     trend="In the last 7 days"   accent="#f59e0b" accentBg="rgba(245,158,11,0.08)"  />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
                Employees by Department
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted-light)' }}>Top 5 departments</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Sans, sans-serif' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Sans, sans-serif' }} />
                <Tooltip cursor={{ fill: 'rgba(124,58,237,0.05)', radius: 6 }}
                  contentStyle={{ background: 'var(--color-surface-light)', borderColor: 'var(--color-border-light)',
                    borderRadius: '12px', color: 'var(--color-text-light)', fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-base font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
              Distribution
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted-light)' }}>By department share</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={companyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-surface-light)', borderColor: 'var(--color-border-light)',
                  borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '13px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {companyData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[index % COLORS.length] }} />
                  <span className="truncate max-w-[110px]" style={{ color: 'var(--color-text-muted-light)' }}>{entry.name}</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-light)' }}>{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   PROFILE INFO ROW
──────────────────────────────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value, accent = '#7c3aed' }) => (
  <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ background: `${accent}15` }}>
      <Icon size={15} style={{ color: accent }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-muted-light)' }}>{label}</p>
      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-light)' }}>
        {value || <span style={{ color: 'var(--color-text-muted-light)', fontWeight: 400 }}>Not set</span>}
      </p>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────────────────
   USER DASHBOARD
──────────────────────────────────────────────────────────────────────────── */
const UserDashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/employees/me');
        setProfile(data);
        setLeaveBalance(data?.leave_balance ?? null);
        if (data?.profile_image) setAvatarPreview(data.profile_image);
      } catch (_) {}
      finally { setProfileLoading(false); }
    };
    fetch();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
    // Upload to backend
    setUploadingAvatar(true);
    try {
      const toBase64 = (f) => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const b64 = await toBase64(file);
      await api.put('/employees/me', { ...(profile || {}), profile_image: b64 });
    } catch (_) {} finally {
      setUploadingAvatar(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const joinedDate = profile?.date_of_joining
    ? new Date(profile.date_of_joining).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      {/* Header greeting */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted-light)' }}>
          Welcome to your personal dashboard.
        </p>
      </div>

      {profileLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
          <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}`}</style>
        </div>
      ) : (
        <>
          {/* ── Profile Card ─────────────────────────────────────────────── */}
          <div className="card overflow-hidden">
            {/* Top banner */}
            <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            {/* Avatar + name */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-5">
                {/* Avatar */}
                <div className="relative group w-fit">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 flex items-center justify-center"
                    style={{ borderColor: 'var(--color-surface-light)', background: 'rgba(124,58,237,0.1)' }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-3xl font-bold" style={{ color: '#7c3aed' }}>
                          {(user?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                    }
                  </div>
                  {/* Upload overlay */}
                  <label htmlFor="avatar-upload"
                    className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <div className="text-center">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" className="mx-auto mb-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-white text-xs font-medium">{uploadingAvatar ? 'Saving…' : 'Change'}</span>
                    </div>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>

                {/* Name + role + leave balance */}
                <div className="sm:pb-1 flex-1">
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
                    {user?.name || 'Employee'}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted-light)' }}>
                    {profile?.designation || user?.role || 'Employee'}
                    {profile?.department ? ` · ${profile.department}` : ''}
                  </p>
                </div>

                {/* Leave balance chip */}
                {leaveBalance !== null && (
                  <div className="flex flex-col items-center px-5 py-3 rounded-xl sm:self-end"
                    style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)' }}>
                    <span className="text-2xl font-bold" style={{ color: '#7c3aed', fontFamily: 'Outfit, sans-serif' }}>
                      {leaveBalance}
                    </span>
                    <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>Leave Days</span>
                  </div>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow icon={IdCard}    label="Employee ID"  value={profile?.emp_id}     accent="#7c3aed" />
                  <InfoRow icon={Mail}      label="Email"        value={profile?.email || user?.email} accent="#4f46e5" />
                  <InfoRow icon={Phone}     label="Phone"        value={profile?.phone}       accent="#0ea5e9" />
                  <InfoRow icon={Briefcase} label="Department"   value={profile?.department}  accent="#10b981" />
                </div>
                <div>
                  <InfoRow icon={User}      label="Role / Position" value={profile?.designation} accent="#f59e0b" />
                  <InfoRow icon={Award}     label="Company"         value={profile?.company}     accent="#7c3aed" />
                  <InfoRow icon={Calendar}  label="Date of Joining" value={joinedDate}           accent="#4f46e5" />
                  <InfoRow icon={TrendingUp} label="Status"         value={profile?.status}      accent={profile?.status === 'Active' ? '#10b981' : '#ef4444'} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick tips / no-profile notice ──────────────────────────── */}
          {!profile && (
            <div className="card p-5 flex items-center gap-4"
              style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.12)' }}>
                <User size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-light)' }}>
                  Profile not complete
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted-light)' }}>
                  Your employee profile has not been set up by admin yet. Contact your HR manager.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────────
   ROOT DASHBOARD — routes admin vs user
──────────────────────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;