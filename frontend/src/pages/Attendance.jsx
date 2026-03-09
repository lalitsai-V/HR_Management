import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Mock data — replace with API call
const MOCK_ATTENDANCE = {
  '2026-03-02': 'present', '2026-03-03': 'present', '2026-03-04': 'half',
  '2026-03-05': 'present', '2026-03-06': 'present', '2026-03-09': 'present',
  '2026-03-10': 'present', '2026-03-11': 'present', '2026-03-12': 'present',
  '2026-03-13': 'present', '2026-03-16': 'present', '2026-03-17': 'present',
  '2026-03-18': 'present', '2026-03-19': 'present', '2026-03-20': 'leave',
};

const MOCK_LEAVE_BALANCE = [
  { type: 'Casual Leave', balance: 5.00, color: '#7c3aed', icon: '🌴' },
  { type: 'Sick Leave',   balance: 3.00, color: '#0ea5e9', icon: '🏥' },
  { type: 'Earned Leave', balance: 12.0, color: '#10b981', icon: '⭐' },
];

const STATUS = {
  present: { color: '#10b981', label: 'Present'  },
  absent:  { color: '#94a3b8', label: 'Absent'   },
  half:    { color: '#f59e0b', label: 'Half Day'  },
  leave:   { color: '#ec4899', label: 'Leave'     },
  holiday: { color: '#8b5cf6', label: 'Holiday'   },
};

const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const pad = (n) => String(n).padStart(2, '0');
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const Attendance = () => {
  const { isDarkMode } = useTheme();
  const today = new Date();
  const [vd, setVd] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const c = {
    textPrimary: isDarkMode ? '#e2e8f0' : '#0f172a',
    textMuted:   isDarkMode ? '#8892a4' : '#64748b',
    textFaint:   isDarkMode ? '#64748b' : '#94a3b8',
    surface:     isDarkMode ? '#161d2f' : '#ffffff',
    border:      isDarkMode ? '#1e2d45' : '#e2e8f2',
  };

  const { year, month } = vd;
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  // ✅ FIXED: moved daysInMonth, daysInPrev, firstDay, today into useMemo deps
  const cells = useMemo(() => {
    const grid = [];
    for (let i = firstDay - 1; i >= 0; i--)
      grid.push({ day: daysInPrev - i, current: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const k = key(year, month, d);
      const dow = new Date(year, month, d).getDay();
      grid.push({
        day: d, current: true, k,
        isToday: d === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        isWeekend: dow === 0 || dow === 6,
        status: MOCK_ATTENDANCE[k],
      });
    }
    const rem = 42 - grid.length;
    for (let d = 1; d <= rem; d++) grid.push({ day: d, current: false });
    return grid;
  }, [year, month, firstDay, daysInMonth, daysInPrev, today]);

  const prev = () => setVd(v => v.month === 0  ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const next = () => setVd(v => v.month === 11 ? { year: v.year + 1, month: 0  } : { ...v, month: v.month + 1 });
  const goToday = () => setVd({ year: today.getFullYear(), month: today.getMonth() });

  const prefix = `${year}-${pad(month + 1)}`;
  const presentCount = Object.entries(MOCK_ATTENDANCE).filter(([k, v]) => k.startsWith(prefix) && v === 'present').length;
  const leaveCount   = Object.entries(MOCK_ATTENDANCE).filter(([k, v]) => k.startsWith(prefix) && v === 'leave').length;
  const halfCount    = Object.entries(MOCK_ATTENDANCE).filter(([k, v]) => k.startsWith(prefix) && v === 'half').length;

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5"
          style={{ fontFamily: 'Outfit, sans-serif', color: c.textPrimary }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,0.12)' }}>
            <Calendar size={17} style={{ color: '#7c3aed' }} />
          </div>
          My Attendance
        </h1>
        <p className="text-sm mt-1 ml-10" style={{ color: c.textMuted }}>
          View your monthly attendance summary
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
        {[
          { label: 'Present',  value: presentCount, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  icon: CheckCircle2 },
          { label: 'On Leave', value: leaveCount,   color: '#ec4899', bg: 'rgba(236,72,153,0.08)',  icon: XCircle      },
          { label: 'Half Day', value: halfCount,    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  icon: MinusCircle  },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="card p-4"
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: c.textFaint }}>{label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: c.textPrimary, fontFamily: 'Outfit, sans-serif' }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar card */}
      <div className="card p-6">
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={prev}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${c.border}`,
              background: 'transparent', color: c.textMuted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.border;  e.currentTarget.style.color = c.textMuted; }}
          >
            <ChevronLeft size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: c.textPrimary }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={goToday}
              style={{ padding: '3px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: 'rgba(124,58,237,0.1)', color: '#7c3aed',
                border: '1px solid rgba(124,58,237,0.2)', cursor: 'pointer' }}>
              Today
            </button>
          </div>

          <button onClick={next}
            style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${c.border}`,
              background: 'transparent', color: c.textMuted, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.border;  e.currentTarget.style.color = c.textMuted; }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
          {DAYS.map((d) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '6px 0',
              color: d === 'SUN' || d === 'SAT' ? '#a78bfa' : c.textFaint,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((cell, idx) => {
            const s = cell.status ? STATUS[cell.status] : null;
            return (
              <div key={idx} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '6px 2px', borderRadius: 10, opacity: cell.current ? 1 : 0.25,
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => { if (cell.current) e.currentTarget.style.background = isDarkMode ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', marginBottom: 4,
                  background: s ? s.color : 'transparent',
                }} />
                <div style={{
                  width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, fontSize: 13, fontWeight: cell.isToday ? 700 : 500,
                  background: cell.isToday ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent',
                  color: cell.isToday ? '#fff'
                    : cell.isWeekend && cell.current ? '#a78bfa'
                    : c.textPrimary,
                  boxShadow: cell.isToday ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                }}>
                  {cell.day}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '12px 20px',
          marginTop: 20, paddingTop: 16, borderTop: `1px solid ${c.border}`,
        }}>
          {Object.entries(STATUS).map(([k, { color, label }]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.textMuted }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Balance */}
      <div className="card p-6">
        <h2 className="text-base font-bold mb-1"
          style={{ fontFamily: 'Outfit, sans-serif', color: c.textPrimary }}>
          Leave Balance
        </h2>
        <p className="text-sm mb-5" style={{ color: c.textMuted }}>Your available leave days</p>

        <div className="space-y-3">
          {MOCK_LEAVE_BALANCE.map(({ type, balance, color, icon }) => (
            <div key={type}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                background: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                border: `1px solid ${c.border}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.border; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${color}15`, border: `1px solid ${color}30`, flexShrink: 0 }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: c.textPrimary }}>{type}</p>
                  <p style={{ fontSize: 12, color: c.textFaint }}>Available balance</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'Outfit, sans-serif' }}>
                  {balance.toFixed(2)}
                </p>
                <p style={{ fontSize: 11, color: c.textFaint }}>days</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attendance;