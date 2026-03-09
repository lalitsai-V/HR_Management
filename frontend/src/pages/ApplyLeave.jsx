import React, { useState } from 'react';
import { ChevronDown, Calendar, FileText, Paperclip, Camera, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const LEAVE_TYPES   = ['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','Paternity Leave'];
const LEAVE_REASONS = ['Personal Work','Medical Appointment','Family Emergency','Vacation','Other'];

// ✅ FIXED: Section and Label moved OUTSIDE component (were inside = bad React pattern)
const Section = ({ title, children, border, textPrimary, textFaint }) => (
  <div className="card overflow-hidden">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px', borderBottom: `1px solid ${border}` }}>
      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 16, fontWeight: 700, color: textPrimary }}>
        {title}
      </h2>
      <ChevronDown size={18} style={{ color: textFaint }} />
    </div>
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
  </div>
);

const Label = ({ children, textMuted }) => (
  <p style={{ fontSize: 13, fontWeight: 500, color: textMuted, marginBottom: 6 }}>{children}</p>
);

function calcDays(from, to) {
  if (!from || !to) return 0;
  const f = new Date(from), t = new Date(to);
  if (t < f) return 0;
  let count = 0, cur = new Date(f);
  while (cur <= t) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

const ApplyLeave = () => {
  const { isDarkMode } = useTheme();
  const navigate       = useNavigate();

  const c = {
    textPrimary: isDarkMode ? '#e2e8f0' : '#0f172a',
    textMuted:   isDarkMode ? '#8892a4' : '#64748b',
    textFaint:   isDarkMode ? '#64748b' : '#94a3b8',
    surface:     isDarkMode ? '#161d2f' : '#ffffff',
    border:      isDarkMode ? '#1e2d45' : '#e2e8f2',
    inputBg:     isDarkMode ? '#0d1117' : '#ffffff',
  };

  const [form, setForm]           = useState({ leaveType: '', from: '', to: '', reason: '', description: '' });
  const [submitted, setSubmitted] = useState(false);

  const totalDays = calcDays(form.from, form.to);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ leaveType: '', from: '', to: '', reason: '', description: '' });
    }, 3000);
  };

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: `1px solid ${c.border}`, background: c.inputBg,
    color: c.textPrimary, fontSize: 14, fontFamily: 'DM Sans, sans-serif',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
  };

  const onFocus = (e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.2)'; };
  const onBlur  = (e) => { e.target.style.borderColor = c.border;  e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', maxWidth: 640 }} className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5"
          style={{ fontFamily: 'Outfit, sans-serif', color: c.textPrimary }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={17} style={{ color: '#7c3aed' }} />
          </div>
          Apply Leave
        </h1>
        <p className="text-sm mt-1 ml-10" style={{ color: c.textMuted }}>Submit a leave request for approval</p>
      </div>

      {/* Success */}
      {submitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 16,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>Leave request submitted!</p>
            <p style={{ fontSize: 12, color: c.textMuted }}>Your request has been sent for admin approval.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Leave Type */}
        <Section title="Leave Type" border={c.border} textPrimary={c.textPrimary} textFaint={c.textFaint}>
          <div>
            <Label textMuted={c.textMuted}>Select Leave Type</Label>
            <div style={{ position: 'relative' }}>
              <select required value={form.leaveType}
                onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                style={{ ...inp, appearance: 'none', paddingRight: 40, cursor: 'pointer' }}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="" disabled>Select leave type</option>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', color: c.textFaint, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['From','from'],['To','to']].map(([label, field]) => (
              <div key={field}>
                <Label textMuted={c.textMuted}>{label}</Label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={14} style={{ position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: c.textFaint, pointerEvents: 'none' }} />
                  <input type="date" required value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    style={{ ...inp, paddingLeft: 34 }}
                    onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            ))}
          </div>

          {/* Total days */}
          {totalDays > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderRadius: 12, background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed', fontFamily: 'Outfit, sans-serif' }}>
                {totalDays}
              </span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed' }}>Total Day(s)</p>
                <p style={{ fontSize: 11, color: c.textFaint }}>{form.from} → {form.to}</p>
              </div>
            </div>
          )}
        </Section>

        {/* Leave Reason */}
        <Section title="Leave Reason" border={c.border} textPrimary={c.textPrimary} textFaint={c.textFaint}>
          <div>
            <Label textMuted={c.textMuted}>Leave Reason</Label>
            <div style={{ position: 'relative' }}>
              <select value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                style={{ ...inp, appearance: 'none', paddingRight: 40, cursor: 'pointer' }}
                onFocus={onFocus} onBlur={onBlur}>
                <option value="">Select a reason</option>
                {LEAVE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', color: c.textFaint, pointerEvents: 'none' }} />
            </div>
          </div>

          <div>
            <Label textMuted={c.textMuted}>Description</Label>
            <textarea rows={4} placeholder="Enter additional details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...inp, resize: 'vertical', minHeight: 100 }}
              onFocus={onFocus} onBlur={onBlur} />
          </div>

          <div>
            <Label textMuted={c.textMuted}>
              Attachment <span style={{ color: c.textFaint, fontWeight: 400 }}>(Optional)</span>
            </Label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ icon: Camera, label: 'Camera', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
                { icon: Paperclip, label: 'Attach', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' }]
                .map(({ icon: Icon, label, color, bg }) => (
                  <button key={label} type="button"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                      borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      background: bg, color, border: `1px solid ${color}30`, transition: 'opacity 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.75'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={() => navigate('/attendance')}
            style={{ padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', color: c.textMuted, border: `1px solid ${c.border}`,
              background: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(148,163,184,0.08)' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>
            Apply Leave <ArrowRight size={14} />
          </button>
        </div>

      </form>
    </div>
  );
};

export default ApplyLeave;