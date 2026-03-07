import React, { useMemo } from 'react';
import { Users, Building2, UserPlus, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../context/EmployeeContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { employees, loading } = useEmployees();

  const stats = useMemo(() => {
    if (!employees || employees.length === 0) {
      return {
        totalEmployees: 0,
        totalCompanies: 0,
        recentAdded: 0,
        activeEmployees: 0,
      };
    }

    const companies = new Set(employees.map(emp => emp.company));
    const activeCount = employees.filter(emp => emp.status === 'Active').length;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCount = employees.filter(emp => new Date(emp.created_at) > last7Days).length;

    return {
      totalEmployees: employees.length,
      totalCompanies: companies.size,
      activeEmployees: activeCount,
      recentAdded: recentCount,
    };
  }, [employees]);

  const companyData = useMemo(() => {
    const counts = {};
    employees.forEach(emp => {
      counts[emp.company] = (counts[emp.company] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [employees]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading && employees.length === 0) {
    return <div className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your employees today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Total Employees" value={stats.totalEmployees} trend="+12% from last month" color="bg-blue-500" />
        <StatCard icon={Building2} title="Total Companies" value={stats.totalCompanies} trend="Across departments" color="bg-indigo-500" />
        <StatCard icon={TrendingUp} title="Active Employees" value={stats.activeEmployees} trend="Currently working" color="bg-emerald-500" />
        <StatCard icon={UserPlus} title="Recently Added" value={stats.recentAdded} trend="In the last 7 days" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Employees by Company/Department</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-border-light)', borderRadius: '8px', color: 'var(--color-text-light)'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Top Departments Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'var(--color-surface-light)', borderColor: 'var(--color-border-light)', borderRadius: '8px', color: 'var(--color-text-light)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center flex-wrap gap-4 mt-4">
              {companyData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, trend, color }) => (
  <div className="card p-6 flex flex-col relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110 ${color}`}></div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</h3>
    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{trend}</p>
  </div>
);

export default Dashboard;
