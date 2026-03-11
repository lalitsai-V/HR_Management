import React, { useState, useEffect } from 'react';
import {
  DollarSign, Download, Search, ChevronDown, CheckCircle,
  Clock, XCircle, TrendingUp, Users, Banknote, FileText,
  Filter, Eye, Send, MoreHorizontal, Calendar, Building2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const STATUS_META = {
  Paid:    { color: '#10b981', bg: 'rgba(16,185,129,0.10)', icon: CheckCircle },
  Pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)',  icon: Clock       },
  Failed:  { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   icon: XCircle     },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, accent, dark }) => (
  <div
    style={{
      background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(15,23,42,0.08)',
      borderRadius: '16px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = dark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(15,23,42,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div
        style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: `${accent}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <TrendingUp size={14} style={{ color: accent, opacity: 0.6 }} />
    </div>
    <div>
      <p style={{ fontSize: '22px', fontWeight: '700', color: dark ? '#f1f5f9' : '#0f172a', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px' }}>
        {value}
      </p>
      <p style={{ fontSize: '13px', color: dark ? 'rgba(148,163,184,0.7)' : '#64748b', fontFamily: 'DM Sans, sans-serif', marginTop: '2px' }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: accent, fontFamily: 'DM Sans, sans-serif', marginTop: '4px', fontWeight: '600' }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const Icon = meta.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px',
      background: meta.bg, color: meta.color,
      fontSize: '12px', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
    }}>
      <Icon size={11} />
      {status}
    </span>
  );
};

const SlipModal = ({ record, onClose, dark }) => {
  if (!record) return null;
  const gross = record.salary || 0;
  const hra = Math.round(gross * 0.4);
  const basic = Math.round(gross * 0.5);
  const ta = Math.round(gross * 0.1);
  const pf = Math.round(gross * 0.12);
  const tax = Math.round(gross * 0.05);
  const net = gross - pf - tax;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: dark ? '#0f172a' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
          borderRadius: '20px', width: '100%', maxWidth: '520px',
          padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>V</span>
              </div>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: '700', color: dark ? '#f1f5f9' : '#0f172a', fontSize: '15px' }}>VisoVersa</span>
            </div>
            <p style={{ fontSize: '11px', color: dark ? '#64748b' : '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>{record.company}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: '700', color: dark ? '#a78bfa' : '#7c3aed', fontFamily: 'Sora, sans-serif' }}>PAYSLIP</p>
            <p style={{ fontSize: '11px', color: dark ? '#64748b' : '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>{record.month} {record.year}</p>
          </div>
        </div>

        {/* Employee info */}
        <div style={{ background: dark ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.04)', border: dark ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(124,58,237,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontFamily: 'Sora, sans-serif', fontWeight: '600', fontSize: '15px', color: dark ? '#f1f5f9' : '#0f172a' }}>{record.name}</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
            {[['EMP ID', record.emp_id], ['Dept', record.department || '—'], ['Designation', record.designation || '—']].map(([k, v]) => (
              <div key={k}>
                <span style={{ fontSize: '10px', color: dark ? '#64748b' : '#94a3b8', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</span>
                <p style={{ fontSize: '12px', fontWeight: '600', color: dark ? '#cbd5e1' : '#374151', fontFamily: 'DM Sans, sans-serif' }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Earnings</p>
            {[['Basic', basic], ['HRA', hra], ['Travel Allow.', ta]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: dark ? '#94a3b8' : '#64748b', fontFamily: 'DM Sans, sans-serif' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: dark ? '#e2e8f0' : '#1e293b', fontFamily: 'DM Sans, sans-serif' }}>{fmt(v)}</span>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Deductions</p>
            {[['PF (12%)', pf], ['Income Tax', tax]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: dark ? '#94a3b8' : '#64748b', fontFamily: 'DM Sans, sans-serif' }}>{k}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', fontFamily: 'DM Sans, sans-serif' }}>- {fmt(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Net Pay */}
        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(79,70,229,0.1))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: dark ? '#a78bfa' : '#7c3aed', fontFamily: 'DM Sans, sans-serif' }}>Net Pay</span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: dark ? '#f1f5f9' : '#0f172a', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px' }}>{fmt(net)}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', background: 'transparent', color: dark ? '#94a3b8' : '#64748b', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', fontWeight: '600' }}
          >
            Close
          </button>
          <button
            style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Payroll Page ─────────────────────────────────────────────────────────
const Payroll = () => {
  const { isDarkMode } = useTheme();
  const dark = isDarkMode;

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months[now.getMonth()]);
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [employees, setEmployees]         = useState([]);
  const [payroll, setPayroll]             = useState([]);
  const [loadingEmps, setLoadingEmps]     = useState(true);
  const [processing, setProcessing]       = useState(null);
  const [slipRecord, setSlipRecord]       = useState(null);

  // Fetch employees from your existing API
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/employees');
        setEmployees(data || []);
        // Build payroll records from employees
        setPayroll(
          (data || []).map(emp => ({
            ...emp,
            month: selectedMonth,
            year: selectedYear,
            status: 'Pending',
            paid_on: null,
          }))
        );
      } catch (err) {
        console.error('Failed to load employees', err);
      } finally {
        setLoadingEmps(false);
      }
    };
    load();
  }, []);

  // Update month/year on payroll records when selector changes
  useEffect(() => {
    setPayroll(prev => prev.map(r => ({ ...r, month: selectedMonth, year: selectedYear })));
  }, [selectedMonth, selectedYear]);

  const markPaid = (emp_id) => {
    setProcessing(emp_id);
    setTimeout(() => {
      setPayroll(prev => prev.map(r =>
        r.emp_id === emp_id
          ? { ...r, status: 'Paid', paid_on: new Date().toLocaleDateString('en-IN') }
          : r
      ));
      setProcessing(null);
    }, 900);
  };

  const markAllPaid = () => {
    setPayroll(prev => prev.map(r =>
      r.status === 'Pending'
        ? { ...r, status: 'Paid', paid_on: new Date().toLocaleDateString('en-IN') }
        : r
    ));
  };

  // Stats
  const totalSalary  = payroll.reduce((s, r) => s + (r.salary || 0), 0);
  const paidCount    = payroll.filter(r => r.status === 'Paid').length;
  const pendingCount = payroll.filter(r => r.status === 'Pending').length;
  const paidAmount   = payroll.filter(r => r.status === 'Paid').reduce((s, r) => s + (r.salary || 0), 0);

  // Filter
  const filtered = payroll.filter(r => {
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase()) ||
                        r.emp_id?.toLowerCase().includes(search.toLowerCase()) ||
                        r.department?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Styles helpers
  const card = {
    background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
    border: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(15,23,42,0.08)',
    borderRadius: '16px',
  };

  const inputStyle = {
    background: dark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
    color: dark ? '#e2e8f0' : '#0f172a',
    borderRadius: '10px',
    padding: '8px 14px',
    fontSize: '13px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .payrow:hover { background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(124,58,237,0.03)'} !important; }
        .pay-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .pay-btn { transition: all 0.15s; }
      `}</style>

      <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Banknote size={18} style={{ color: '#fff' }} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: dark ? '#f1f5f9' : '#0f172a', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px', margin: 0 }}>
                Payroll
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: dark ? 'rgba(148,163,184,0.7)' : '#64748b', margin: 0 }}>
              Manage and process employee salaries for {selectedMonth} {selectedYear}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Month selector */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                style={{ ...inputStyle, paddingRight: '32px', appearance: 'none', cursor: 'pointer' }}
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: dark ? '#64748b' : '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {/* Year selector */}
            <div style={{ position: 'relative' }}>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                style={{ ...inputStyle, paddingRight: '32px', appearance: 'none', cursor: 'pointer' }}
              >
                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: dark ? '#64748b' : '#94a3b8', pointerEvents: 'none' }} />
            </div>

            {pendingCount > 0 && (
              <button
                onClick={markAllPaid}
                className="pay-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
              >
                <Send size={14} /> Process All ({pendingCount})
              </button>
            )}

            <button
              className="pay-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.1)', background: 'transparent', color: dark ? '#94a3b8' : '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard icon={DollarSign}   label="Total Payroll"    value={fmt(totalSalary)}  sub={`${payroll.length} employees`}  accent="#7c3aed" dark={dark} />
          <StatCard icon={CheckCircle}  label="Paid This Month"  value={fmt(paidAmount)}   sub={`${paidCount} processed`}       accent="#10b981" dark={dark} />
          <StatCard icon={Clock}        label="Pending Payment"  value={String(pendingCount)} sub="awaiting processing"         accent="#f59e0b" dark={dark} />
          <StatCard icon={Users}        label="Total Employees"  value={String(payroll.length)} sub="on payroll"               accent="#3b82f6" dark={dark} />
        </div>

        {/* ── Table Card ── */}
        <div style={{ ...card, overflow: 'hidden' }}>

          {/* Table toolbar */}
          <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.07)', flexWrap: 'wrap', gap: '12px' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: dark ? '#64748b' : '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, width: '100%', paddingLeft: '34px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {['All', 'Pending', 'Paid'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                    fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none',
                    background: statusFilter === s
                      ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                      : dark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
                    color: statusFilter === s ? '#fff' : dark ? '#94a3b8' : '#64748b',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loadingEmps ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', gap: '6px' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.7 }} />
                ))}
              </div>
              <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }`}</style>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: dark ? '#475569' : '#94a3b8', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
              No employees found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: dark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                    {['Employee', 'Department', 'Company', 'Salary', 'Status', 'Paid On', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', color: dark ? 'rgba(148,163,184,0.5)' : '#94a3b8', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record, idx) => (
                    <tr
                      key={record.emp_id}
                      className="payrow"
                      style={{
                        borderTop: dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.05)',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Employee */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `linear-gradient(135deg, hsl(${(idx * 47) % 360},60%,55%), hsl(${(idx * 47 + 40) % 360},70%,45%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', fontFamily: 'Sora, sans-serif', flexShrink: 0 }}>
                            {record.name?.charAt(0)?.toUpperCase() || 'E'}
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: dark ? '#e2e8f0' : '#1e293b', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{record.name}</p>
                            <p style={{ fontSize: '11px', color: dark ? '#475569' : '#94a3b8', margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{record.emp_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', color: dark ? '#94a3b8' : '#64748b', fontFamily: 'DM Sans, sans-serif' }}>
                          {record.department || '—'}
                        </span>
                      </td>

                      {/* Company */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Building2 size={12} style={{ color: dark ? '#4f46e5' : '#7c3aed', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px', color: dark ? '#94a3b8' : '#64748b', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}>
                            {record.company === 'VaisoVerse Technology' ? 'VaisoVerse' : 'We Marketing'}
                          </span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: dark ? '#f1f5f9' : '#0f172a', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.3px' }}>
                          {record.salary ? fmt(record.salary) : <span style={{ color: dark ? '#475569' : '#94a3b8', fontWeight: '400', fontSize: '13px' }}>Not set</span>}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={record.status} />
                      </td>

                      {/* Paid On */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', color: dark ? '#475569' : '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                          {record.paid_on || '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => setSlipRecord(record)}
                            title="View Payslip"
                            className="pay-btn"
                            style={{ width: '30px', height: '30px', borderRadius: '8px', border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.1)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: dark ? '#94a3b8' : '#64748b' }}
                          >
                            <Eye size={13} />
                          </button>

                          {record.status === 'Pending' && (
                            <button
                              onClick={() => markPaid(record.emp_id)}
                              disabled={processing === record.emp_id}
                              className="pay-btn"
                              style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: processing === record.emp_id ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: processing === record.emp_id ? 'not-allowed' : 'pointer', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap' }}
                            >
                              {processing === record.emp_id ? '...' : 'Pay Now'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer summary */}
          {!loadingEmps && filtered.length > 0 && (
            <div style={{ padding: '14px 20px', borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: dark ? '#475569' : '#94a3b8', fontFamily: 'DM Sans, sans-serif' }}>
                Showing {filtered.length} of {payroll.length} employees
              </span>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[['Total', fmt(filtered.reduce((s,r)=>s+(r.salary||0),0)), '#7c3aed'], ['Paid', fmt(filtered.filter(r=>r.status==='Paid').reduce((s,r)=>s+(r.salary||0),0)), '#10b981'], ['Pending', fmt(filtered.filter(r=>r.status==='Pending').reduce((s,r)=>s+(r.salary||0),0)), '#f59e0b']].map(([k,v,c])=>(
                  <div key={k} style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '10px', color: dark ? '#475569' : '#94a3b8', fontFamily: 'DM Sans, sans-serif', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</p>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: c, fontFamily: 'Sora, sans-serif', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payslip modal */}
      <SlipModal record={slipRecord} onClose={() => setSlipRecord(null)} dark={dark} />
    </>
  );
};

export default Payroll;