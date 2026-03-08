import React, { useMemo } from 'react';
import { Users, Building2, UserPlus, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../context/EmployeeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { employees, loading } = useEmployees();

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
    employees.forEach((emp) => {
      counts[emp.company] = (counts[emp.company] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [employees]);

  const COLORS = ['#7c3aed', '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'];

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#7c3aed',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-7" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Page header */}
      <div className="flex justify-between items-start">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
          >
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted-light)' }}>
            Here's what's happening with your team today.
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium"
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.15)',
            color: '#7c3aed',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#7c3aed', animation: 'pulse 2s infinite' }}
          />
          Live data
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={Users}
          title="Total Employees"
          value={stats.totalEmployees}
          trend="+12% from last month"
          accent="#7c3aed"
          accentBg="rgba(124,58,237,0.08)"
        />
        <StatCard
          icon={Building2}
          title="Departments"
          value={stats.totalCompanies}
          trend="Across all teams"
          accent="#4f46e5"
          accentBg="rgba(79,70,229,0.08)"
        />
        <StatCard
          icon={TrendingUp}
          title="Active"
          value={stats.activeEmployees}
          trend="Currently working"
          accent="#10b981"
          accentBg="rgba(16,185,129,0.08)"
        />
        <StatCard
          icon={UserPlus}
          title="Recently Added"
          value={stats.recentAdded}
          trend="In the last 7 days"
          accent="#f59e0b"
          accentBg="rgba(245,158,11,0.08)"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Bar chart — wider */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-base font-semibold"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
              >
                Employees by Department
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted-light)' }}>Top 5 departments</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontFamily: 'DM Sans, sans-serif' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontFamily: 'DM Sans, sans-serif' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(124,58,237,0.05)', radius: 6 }}
                  contentStyle={{
                    background: 'var(--color-surface-light)',
                    borderColor: 'var(--color-border-light)',
                    borderRadius: '12px',
                    color: 'var(--color-text-light)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="mb-6">
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
            >
              Distribution
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted-light)' }}>By department share</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-light)',
                    borderColor: 'var(--color-border-light)',
                    borderRadius: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {companyData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate max-w-[110px]" style={{ color: 'var(--color-text-muted-light)' }}>
                    {entry.name}
                  </span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--color-text-light)' }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, trend, accent, accentBg }) => (
  <div
    className="card p-5 relative overflow-hidden group transition-all duration-200 cursor-default"
    style={{ '--accent': accent }}
  >
    {/* Subtle accent glow top-right */}
    <div
      className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: `radial-gradient(circle, ${accent}30, transparent 70%)` }}
    />

    <div className="flex items-start justify-between mb-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accentBg }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div
        className="w-1 h-8 rounded-full"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)`, opacity: 0.4 }}
      />
    </div>

    <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted-light)' }}>{title}</p>
    <div
      className="text-3xl font-bold mb-1.5"
      style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
    >
      {value}
    </div>
    <p className="text-xs" style={{ color: '#94a3b8' }}>{trend}</p>
  </div>
);

export default Dashboard;