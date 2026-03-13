import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, DollarSign, Eye, Save, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const pad = (n) => String(n).padStart(2, '0');

const PayrollAdmin = () => {
  const { isDarkMode } = useTheme();
  const today = new Date();
  const initialMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

  const [month, setMonth] = useState(initialMonth);
  const [employees, setEmployees] = useState([]);
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const c = useMemo(
    () => ({
      textPrimary: isDarkMode ? '#e2e8f0' : '#0f172a',
      textMuted: isDarkMode ? '#8892a4' : '#64748b',
      textFaint: isDarkMode ? '#64748b' : '#94a3b8',
      border: isDarkMode ? '#1e2d45' : '#e2e8f2',
      surface: isDarkMode ? '#0f172a' : '#ffffff',
    }),
    [isDarkMode]
  );

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [{ data: empList }, { data: payrollList }] = await Promise.all([
        api.get('/employees'),
        api.get('/payroll', { params: { month } }),
      ]);

      setEmployees(empList || []);

      const byEmp = {};
      (payrollList || []).forEach((p) => {
        if (!p.emp_id) return;
        byEmp[p.emp_id] = {
          basic_salary: p.basic_salary ?? '',
          allowances: p.allowances ?? '',
          deductions: p.deductions ?? '',
          net_pay: p.net_pay ?? '',
          status: p.status || 'finalized',
          payment_date: p.payment_date || '',
        };
      });

      setRows(byEmp);
    } catch (err) {
      console.error('Failed to load payroll', err);
      setError('Failed to load employees or payroll for this month');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const handleFieldChange = (emp_id, field, value) => {
    setRows((prev) => {
      const current = prev[emp_id] || {
        basic_salary: '',
        allowances: '',
        deductions: '',
        net_pay: '',
        status: 'finalized',
        payment_date: '',
      };

      const updated = { ...current, [field]: value };

      // Auto compute net pay if numeric fields change
      if (['basic_salary', 'allowances', 'deductions'].includes(field)) {
        const basic = Number(updated.basic_salary) || 0;
        const allow = Number(updated.allowances) || 0;
        const deduct = Number(updated.deductions) || 0;
        updated.net_pay = basic + allow - deduct;
      }

      return { ...prev, [emp_id]: updated };
    });
  };

  const saveRow = async (emp_id) => {
    const row = rows[emp_id];
    if (!row || !row.basic_salary) {
      alert('Please enter at least the basic salary before saving.');
      return;
    }

    setSavingId(emp_id);
    try {
      await api.post('/payroll', {
        emp_id,
        month,
        basic_salary: Number(row.basic_salary),
        allowances: Number(row.allowances) || 0,
        deductions: Number(row.deductions) || 0,
        net_pay: Number(row.net_pay) || undefined,
        payment_date: row.payment_date || null,
        status: row.status || 'finalized',
      });
    } catch (err) {
      console.error('Failed to save payroll', err);
      alert('Failed to save payroll for this employee');
    } finally {
      setSavingId(null);
    }
  };

  const formatCurrency = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);
  };

  const openHistory = async (emp) => {
    setSelectedEmployee(emp);
    setHistoryError('');
    setPayrollHistory([]);
    setHistoryOpen(true);
    setHistoryLoading(true);

    try {
      const { data } = await api.get('/payroll', { params: { emp_id: emp.emp_id } });
      setPayrollHistory(data || []);
    } catch (err) {
      console.error('Failed to load payroll history', err);
      setHistoryError('Unable to load payroll history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setSelectedEmployee(null);
    setPayrollHistory([]);
    setHistoryError('');
    setHistoryLoading(false);
  };

  const exportHistoryCsv = () => {
    if (!selectedEmployee || !payrollHistory.length) return;

    const headers = ['Month', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Payment Date', 'Status'];
    const rowsCsv = payrollHistory.map((row) => [
      row.month || '',
      row.basic_salary ?? '',
      row.allowances ?? '',
      row.deductions ?? '',
      row.net_pay ?? '',
      row.payment_date ? new Date(row.payment_date).toLocaleDateString() : '',
      row.status || '',
    ]);

    const csvContent = [headers, ...rowsCsv]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payroll-${selectedEmployee.emp_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const markPayrollAsPaid = async (record) => {
    if (!selectedEmployee || !record) return;

    try {
      await api.post('/payroll', {
        emp_id: selectedEmployee.emp_id,
        month: record.month,
        basic_salary: record.basic_salary,
        allowances: record.allowances,
        deductions: record.deductions,
        net_pay: record.net_pay,
        payment_date: record.payment_date || new Date().toISOString().split('T')[0],
        status: 'paid',
      });
      // refresh history
      await openHistory(selectedEmployee);
    } catch (err) {
      console.error('Failed to mark payroll as paid', err);
      alert('Unable to mark payroll as paid.');
    }
  };

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
              style={{ background: 'rgba(22,163,74,0.12)' }}
            >
              <DollarSign size={17} style={{ color: '#16a34a' }} />
            </div>
            Payroll (Admin)
          </h1>
          <p className="text-sm mt-1 ml-10" style={{ color: c.textMuted }}>
            Maintain official monthly payroll for all employees
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} style={{ color: c.textFaint }} />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
            style={{
              background: 'rgba(37,99,235,0.08)',
              border: '1px solid rgba(37,99,235,0.2)',
              color: '#2563eb',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="card px-4 py-3 text-sm"
          style={{ borderColor: '#fecaca', color: '#b91c1c' }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: c.border }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: c.textMuted }}>
            <DollarSign size={16} style={{ color: c.textFaint }} />
            {loading ? 'Loading employees...' : `${employees.length} employees`}
          </div>
        </div>

        {loading ? (
          <div
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              color: c.textFaint,
              fontSize: 14,
            }}
          >
            Loading payroll data...
          </div>
        ) : employees.length === 0 ? (
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: 'rgba(15,23,42,0.02)',
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  {[
                    'Employee',
                    'Emp ID',
                    'Basic Salary',
                    'Allowances',
                    'Deductions',
                    'Net Pay',
                    'Payment Date',
                    'Status',
                    'History',
                    '',
                  ].map((h, idx) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                        idx >= 8 ? 'text-right' : 'text-left'
                      }`}
                      style={{ color: c.textFaint, whiteSpace: 'nowrap' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const row = rows[emp.emp_id] || {};
                  return (
                    <tr
                      key={emp.emp_id}
                      style={{ borderBottom: `1px solid ${c.border}` }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                            style={{
                              background: 'rgba(124,58,237,0.12)',
                              color: '#a855f7',
                            }}
                          >
                            {emp.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="text-sm font-medium truncate"
                              style={{ color: c.textPrimary }}
                            >
                              {emp.name}
                            </div>
                            {emp.department && (
                              <div
                                className="text-xs truncate"
                                style={{ color: c.textFaint }}
                              >
                                {emp.department}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded"
                          style={{
                            background: 'rgba(148,163,184,0.15)',
                            color: c.textMuted,
                          }}
                        >
                          {emp.emp_id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.basic_salary ?? ''}
                          onChange={(e) =>
                            handleFieldChange(emp.emp_id, 'basic_salary', e.target.value)
                          }
                          className="input-field text-xs"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.allowances ?? ''}
                          onChange={(e) =>
                            handleFieldChange(emp.emp_id, 'allowances', e.target.value)
                          }
                          className="input-field text-xs"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.deductions ?? ''}
                          onChange={(e) =>
                            handleFieldChange(emp.emp_id, 'deductions', e.target.value)
                          }
                          className="input-field text-xs"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={row.net_pay ?? ''}
                          onChange={(e) =>
                            handleFieldChange(emp.emp_id, 'net_pay', e.target.value)
                          }
                          className="input-field text-xs"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={row.payment_date ?? ''}
                          onChange={(e) =>
                            handleFieldChange(emp.emp_id, 'payment_date', e.target.value)
                          }
                          className="input-field text-xs"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={row.status || 'finalized'}
                          onChange={(e) =>
                            handleFieldChange(emp.emp_id, 'status', e.target.value)
                          }
                          className="input-field text-xs"
                        >
                          <option value="draft">Draft</option>
                          <option value="finalized">Finalized</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openHistory(emp)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            background: 'rgba(37,99,235,0.08)',
                            border: '1px solid rgba(37,99,235,0.2)',
                            color: '#2563eb',
                          }}
                        >
                          <Eye size={14} />
                          History
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => saveRow(emp.emp_id)}
                          disabled={savingId === emp.emp_id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            background: 'rgba(22,163,74,0.08)',
                            border: '1px solid rgba(22,163,74,0.3)',
                            color: '#16a34a',
                            opacity: savingId === emp.emp_id ? 0.6 : 1,
                          }}
                        >
                          <Save size={14} />
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {historyOpen && selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeHistory(); }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${c.border}` }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: c.textPrimary }}>
                  {selectedEmployee.name} payroll history
                </h2>
                <p className="text-sm" style={{ color: c.textFaint }}>
                  {selectedEmployee.emp_id} • {month}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  type="button"
                  onClick={exportHistoryCsv}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb' }}
                >
                  <Download size={14} /> Export
                </button>
                <button
                  type="button"
                  onClick={closeHistory}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.2)', color: c.textMuted }}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-auto p-6">
              {historyLoading ? (
                <div className="text-center py-16" style={{ color: c.textFaint }}>
                  Loading history...
                </div>
              ) : historyError ? (
                <div className="text-center py-16" style={{ color: '#b91c1c' }}>
                  {historyError}
                </div>
              ) : payrollHistory.length === 0 ? (
                <div className="text-center py-16" style={{ color: c.textFaint }}>
                  No payroll records found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                        {['Month', 'Basic', 'Allowances', 'Deductions', 'Net Pay', 'Payment Date', 'Status', ''].map((h, idx) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${idx === 7 ? 'text-right' : 'text-left'}`}
                            style={{ color: c.textFaint, whiteSpace: 'nowrap' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payrollHistory.map((record) => (
                        <tr key={`${record.emp_id}-${record.month}`} style={{ borderBottom: `1px solid ${c.border}` }}>
                          <td className="px-4 py-3">{record.month}</td>
                          <td className="px-4 py-3">{formatCurrency(record.basic_salary)}</td>
                          <td className="px-4 py-3">{formatCurrency(record.allowances)}</td>
                          <td className="px-4 py-3">{formatCurrency(record.deductions)}</td>
                          <td className="px-4 py-3">{formatCurrency(record.net_pay)}</td>
                          <td className="px-4 py-3">{record.payment_date ? new Date(record.payment_date).toLocaleDateString() : '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: record.status === 'paid' ? 'rgba(22,163,74,0.12)' : 'rgba(234,179,8,0.12)',
                                border: `1px solid ${record.status === 'paid' ? 'rgba(22,163,74,0.25)' : 'rgba(234,179,8,0.25)'}`,
                                color: record.status === 'paid' ? '#166534' : '#92400e',
                              }}
                            >
                              {record.status === 'paid' ? (
                                <CheckCircle2 size={14} />
                              ) : null}
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {record.status !== 'paid' ? (
                              <button
                                type="button"
                                onClick={() => markPayrollAsPaid(record)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                                style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)', color: '#16a34a' }}
                              >
                                <CheckCircle2 size={14} /> Mark Paid
                              </button>
                            ) : (
                              <span className="text-xs" style={{ color: c.textFaint }}>
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PayrollAdmin;

