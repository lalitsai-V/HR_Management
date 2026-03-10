import React, { useEffect, useState } from 'react';
import { CalendarDays, Users, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const pad = (n) => String(n).padStart(2, '0');

const STATUS_OPTIONS = [
  { key: 'present', label: 'Present', color: '#10b981' },
  { key: 'absent',  label: 'Absent',  color: '#94a3b8' },
  { key: 'late',    label: 'Late',    color: '#f59e0b' },
];

const AdminAttendance = () => {
  const { isDarkMode } = useTheme();
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const c = {
    textPrimary: isDarkMode ? '#e2e8f0' : '#0f172a',
    textMuted:   isDarkMode ? '#8892a4' : '#64748b',
    textFaint:   isDarkMode ? '#64748b' : '#94a3b8',
    border:      isDarkMode ? '#1e2d45' : '#e2e8f2',
    surface:     isDarkMode ? '#0f172a' : '#ffffff',
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: empList }, { data: attendanceList }] = await Promise.all([
        api.get('/employees'),
        api.get('/attendance', { params: { date } }),
      ]);

      setEmployees(empList || []);
      const map = {};
      (attendanceList || []).forEach((r) => {
        if (r.emp_id) {
          map[r.emp_id] = r.status;
        } else if (r.user_id) {
          map[r.user_id] = r.status;
        }
      });

      const combined = (empList || []).map((e) => ({
        emp_id: e.emp_id,
        name: e.name,
        department: e.department,
        status: map[e.emp_id] || 'absent',
      }));
      setRows(combined);
    } catch (err) {
      console.error('Failed to load attendance list', err);
      setError('Failed to load employees or attendance for this date');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const updateStatus = async (emp_id, status) => {
    setSavingId(emp_id);
    try {
      await api.post('/attendance/mark', { emp_id, date, status });
      setRows((prev) =>
        prev.map((r) => (r.emp_id === emp_id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to mark attendance', err);
      alert('Failed to mark attendance');
    } finally {
      setSavingId(null);
    }
  };

  const presentCount = rows.filter((r) => r.status === 'present').length;
  const absentCount = rows.filter((r) => r.status === 'absent').length;
  const lateCount = rows.filter((r) => r.status === 'late').length;

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2.5"
            style={{ fontFamily: 'Outfit, sans-serif', color: c.textPrimary }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)' }}
            >
              <CalendarDays size={17} style={{ color: '#22c55e' }} />
            </div>
            Attendance (Admin)
          </h1>
          <p
            className="text-sm mt-1 ml-10"
            style={{ color: c.textMuted }}
          >
            Mark daily attendance for all employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
            style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: '#7c3aed',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 16,
        }}
      >
        {[
          {
            label: 'Present',
            value: presentCount,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
            icon: CheckCircle2,
          },
          {
            label: 'Absent',
            value: absentCount,
            color: '#94a3b8',
            bg: 'rgba(148,163,184,0.15)',
            icon: XCircle,
          },
          {
            label: 'Late',
            value: lateCount,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)',
            icon: Clock,
          },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div
            key={label}
            className="card p-4"
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: c.textFaint }}>{label}</p>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: c.textPrimary,
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                {loading ? '—' : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: c.border }}
        >
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: c.textFaint }} />
            <span
              className="text-sm font-medium"
              style={{ color: c.textMuted }}
            >
              {loading ? 'Loading employees...' : `${rows.length} employees`}
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 18px',
              color: '#ef4444',
              fontSize: 13,
              borderBottom: `1px solid ${c.border}`,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              color: c.textFaint,
              fontSize: 14,
            }}
          >
            Loading attendance...
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              color: c.textFaint,
              fontSize: 14,
            }}
          >
            No employees found.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: c.border }}>
            {rows.map((row) => (
              <div
                key={row.emp_id}
                className="flex items-center justify-between px-5 py-3 gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{
                      background: 'rgba(124,58,237,0.15)',
                      color: '#e5e7eb',
                    }}
                  >
                    {row.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: c.textPrimary }}
                    >
                      {row.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {row.emp_id}
                      </span>
                      {row.department && <span>{row.department}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => updateStatus(row.emp_id, opt.key)}
                      disabled={savingId === row.emp_id}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150"
                      style={{
                        border: `1px solid ${
                          row.status === opt.key ? opt.color : c.border
                        }`,
                        background:
                          row.status === opt.key
                            ? `${opt.color}20`
                            : 'transparent',
                        color:
                          row.status === opt.key ? opt.color : c.textMuted,
                        opacity:
                          savingId === row.emp_id && row.status !== opt.key
                            ? 0.6
                            : 1,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;

