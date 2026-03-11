import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, FileText, Paperclip, Camera, ArrowRight, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../services/api';

const LEAVE_TYPES   = ['Casual Leave','Sick Leave','Earned Leave','Maternity Leave','Paternity Leave'];
const LEAVE_REASONS = ['Personal Work','Medical Appointment','Family Emergency','Vacation','Other'];

const STATUS_CFG = {
  pending:  { color:'#f59e0b', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.2)',  label:'Pending',  icon:Clock        },
  approved: { color:'#10b981', bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.2)',  label:'Approved', icon:CheckCircle2 },
  rejected: { color:'#ef4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.2)',   label:'Rejected', icon:XCircle      },
};

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
  const { user } = useAuth();
  const navigate = useNavigate();

  const c = {
    textPrimary: isDarkMode ? '#e2e8f0' : '#0f172a',
    textMuted:   isDarkMode ? '#8892a4' : '#64748b',
    textFaint:   isDarkMode ? '#64748b' : '#94a3b8',
    border:      isDarkMode ? '#1e2d45' : '#e2e8f2',
    inputBg:     isDarkMode ? '#0d1117' : '#ffffff',
    surface:     isDarkMode ? '#161d2f' : '#ffffff',
  };

  const [form, setForm]           = useState({ leaveType:'', from:'', to:'', reason:'', description:'' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Leave balance / user info
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  // My requests state
  const [myRequests, setMyRequests]   = useState([]);
  const [reqLoading, setReqLoading]   = useState(true);

  const totalDays = calcDays(form.from, form.to);

  const fetchMyRequests = async () => {
    setReqLoading(true);
    try {
      const { data } = await api.get('/leave-requests');
      setMyRequests(data || []);
    } catch (_) {}
    finally { setReqLoading(false); }
  };

  const fetchLeaveBalance = async () => {
    setBalanceLoading(true);
    try {
      const { data } = await api.get('/employees/me');
      setLeaveBalance(Number(data?.leave_balance ?? 0));
    } catch (_) {
      setLeaveBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => { fetchMyRequests(); fetchLeaveBalance(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leaveType) return setError('Please select a leave type');
    if (totalDays === 0) return setError('Please select valid dates');
    if (leaveBalance !== null && totalDays > leaveBalance) return setError(`You only have ${leaveBalance} day${leaveBalance === 1 ? '' : 's'} left`);

    setLoading(true);
    setError('');
    try {
      await api.post('/leave-requests', {
        employee_name: user?.name,
        leave_type:    form.leaveType,
        from_date:     form.from,
        to_date:       form.to,
        reason:        form.reason,
        description:   form.description,
      });
      setSubmitted(true);
      setForm({ leaveType:'', from:'', to:'', reason:'', description:'' });
      fetchMyRequests(); // refresh list after submit
      fetchLeaveBalance(); // refresh balance after submit (or rejection)
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width:'100%', padding:'10px 14px', borderRadius:12,
    border:`1px solid ${c.border}`, background:c.inputBg,
    color:c.textPrimary, fontSize:14, fontFamily:'DM Sans,sans-serif',
    outline:'none', transition:'all 0.2s', boxSizing:'border-box',
  };
  const onFocus = (e) => { e.target.style.borderColor='#7c3aed'; e.target.style.boxShadow='0 0 0 2px rgba(124,58,237,0.2)'; };
  const onBlur  = (e) => { e.target.style.borderColor=c.border;  e.target.style.boxShadow='none'; };

  return (
    <div style={{ fontFamily:'DM Sans,sans-serif', maxWidth:680 }} className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5"
          style={{ fontFamily:'Outfit,sans-serif', color:c.textPrimary }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'rgba(124,58,237,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FileText size={17} style={{ color:'#7c3aed' }} />
          </div>
          Apply Leave
        </h1>
        <p className="text-sm mt-1 ml-10" style={{ color:c.textMuted }}>Submit a leave request for approval</p>
      </div>

      {/* Leave balance */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:c.textPrimary }}>
            Leave Balance
          </h2>
          <p style={{ fontSize:12, color:c.textFaint, marginTop:2 }}>
            {balanceLoading ? 'Loading balance…' : leaveBalance !== null ? `${leaveBalance} day${leaveBalance === 1 ? '' : 's'} remaining` : 'Unable to load balance.'}
          </p>
        </div>
        {submitted && (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderRadius:16,
            background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle2 size={20} style={{ color:'#10b981', flexShrink:0 }} />
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'#10b981' }}>Leave request submitted!</p>
              <p style={{ fontSize:12, color:c.textMuted }}>Your request has been sent to admin for approval.</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'12px 16px', borderRadius:12,
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
          color:'#ef4444', fontSize:13 }}>{error}</div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>

        {/* Leave Type section */}
        <div className="card overflow-hidden">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'16px 24px', borderBottom:`1px solid ${c.border}` }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:c.textPrimary }}>Leave Type</h2>
            <ChevronDown size={18} style={{ color:c.textFaint }} />
          </div>
          <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>

            <div>
              <p style={{ fontSize:13, fontWeight:500, color:c.textMuted, marginBottom:6 }}>Select Leave Type</p>
              <div style={{ position:'relative' }}>
                <select required value={form.leaveType}
                  onChange={(e) => setForm({...form, leaveType:e.target.value})}
                  style={{...inp, appearance:'none', paddingRight:40, cursor:'pointer'}}
                  onFocus={onFocus} onBlur={onBlur}>
                  <option value="" disabled>Select leave type</option>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} style={{ position:'absolute', right:12, top:'50%',
                  transform:'translateY(-50%)', color:c.textFaint, pointerEvents:'none' }} />
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[['From','from'],['To','to']].map(([label,field]) => (
                <div key={field}>
                  <p style={{ fontSize:13, fontWeight:500, color:c.textMuted, marginBottom:6 }}>{label}</p>
                  <div style={{ position:'relative' }}>
                    <Calendar size={14} style={{ position:'absolute', left:12, top:'50%',
                      transform:'translateY(-50%)', color:c.textFaint, pointerEvents:'none' }} />
                    <input type="date" required value={form[field]}
                      onChange={(e) => setForm({...form, [field]:e.target.value})}
                      style={{...inp, paddingLeft:34}}
                      onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
              ))}
            </div>

            {totalDays > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                borderRadius:12, background:'rgba(124,58,237,0.07)', border:'1px solid rgba(124,58,237,0.15)' }}>
                <span style={{ fontSize:28, fontWeight:800, color:'#7c3aed', fontFamily:'Outfit,sans-serif' }}>{totalDays}</span>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#7c3aed' }}>Working Day{totalDays>1?'s':''}</p>
                  <p style={{ fontSize:11, color:c.textFaint }}>{form.from} → {form.to} · weekends excluded</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leave Reason section */}
        <div className="card overflow-hidden">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'16px 24px', borderBottom:`1px solid ${c.border}` }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:c.textPrimary }}>Leave Reason</h2>
            <ChevronDown size={18} style={{ color:c.textFaint }} />
          </div>
          <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>

            <div>
              <p style={{ fontSize:13, fontWeight:500, color:c.textMuted, marginBottom:6 }}>Leave Reason</p>
              <div style={{ position:'relative' }}>
                <select value={form.reason}
                  onChange={(e) => setForm({...form, reason:e.target.value})}
                  style={{...inp, appearance:'none', paddingRight:40, cursor:'pointer'}}
                  onFocus={onFocus} onBlur={onBlur}>
                  <option value="">Select a reason</option>
                  {LEAVE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={16} style={{ position:'absolute', right:12, top:'50%',
                  transform:'translateY(-50%)', color:c.textFaint, pointerEvents:'none' }} />
              </div>
            </div>

            <div>
              <p style={{ fontSize:13, fontWeight:500, color:c.textMuted, marginBottom:6 }}>Description</p>
              <textarea rows={4} placeholder="Enter additional details..."
                value={form.description}
                onChange={(e) => setForm({...form, description:e.target.value})}
                style={{...inp, resize:'vertical', minHeight:100}}
                onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div>
              <p style={{ fontSize:13, fontWeight:500, color:c.textMuted, marginBottom:6 }}>
                Attachment <span style={{ color:c.textFaint, fontWeight:400 }}>(Optional)</span>
              </p>
              <div style={{ display:'flex', gap:10 }}>
                {[{icon:Camera,label:'Camera',color:'#7c3aed',bg:'rgba(124,58,237,0.1)'},
                  {icon:Paperclip,label:'Attach',color:'#0ea5e9',bg:'rgba(14,165,233,0.1)'}].map(({icon:Icon,label,color,bg}) => (
                  <button key={label} type="button"
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                      borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer',
                      background:bg, color, border:`1px solid ${color}30` }}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button type="button" onClick={() => navigate('/attendance')}
            style={{ padding:'10px 20px', borderRadius:12, fontSize:13, fontWeight:500,
              cursor:'pointer', color:c.textMuted, border:`1px solid ${c.border}`,
              background:isDarkMode?'rgba(255,255,255,0.04)':'rgba(148,163,184,0.08)' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ padding:'10px 24px', fontSize:13 }} disabled={loading}>
            {loading ? 'Submitting...' : <><span>Apply Leave</span><ArrowRight size={14}/></>}
          </button>
        </div>
      </form>

      {/* ── MY LEAVE REQUESTS ─────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 24px', borderBottom:`1px solid ${c.border}` }}>
          <div>
            <h2 style={{ fontFamily:'Outfit,sans-serif', fontSize:16, fontWeight:700, color:c.textPrimary }}>
              My Leave Requests
            </h2>
            <p style={{ fontSize:12, color:c.textFaint, marginTop:2 }}>
              Track the status of your submitted requests
            </p>
          </div>
          <button onClick={fetchMyRequests}
            style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8,
              fontSize:12, fontWeight:500, cursor:'pointer', color:'#7c3aed',
              background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {reqLoading ? (
          <div style={{ padding:'32px 24px', textAlign:'center', color:c.textFaint, fontSize:14 }}>
            Loading your requests...
          </div>
        ) : myRequests.length === 0 ? (
          <div style={{ padding:'32px 24px', textAlign:'center' }}>
            <FileText size={32} style={{ color:c.textFaint, margin:'0 auto 8px' }} />
            <p style={{ fontSize:14, color:c.textFaint }}>No leave requests yet.</p>
            <p style={{ fontSize:12, color:c.textFaint, marginTop:4 }}>Submit your first request above.</p>
          </div>
        ) : (
          myRequests.map((req, idx) => {
            const cfg   = STATUS_CFG[req.status] || STATUS_CFG.pending;
            const SIcon = cfg.icon;
            return (
              <div key={req.id}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 24px',
                  borderBottom: idx < myRequests.length-1 ? `1px solid ${c.border}` : 'none' }}>

                {/* Leave type icon */}
                <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
                  background:'rgba(124,58,237,0.1)', display:'flex', alignItems:'center',
                  justifyContent:'center' }}>
                  <FileText size={17} style={{ color:'#7c3aed' }} />
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:c.textPrimary }}>{req.leave_type}</p>
                  <div style={{ display:'flex', gap:12, marginTop:3, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:c.textFaint }}>
                      {req.from_date} → {req.to_date}
                    </span>
                    <span style={{ fontSize:12, color:c.textMuted, fontWeight:500 }}>
                      {req.total_days} day{req.total_days > 1 ? 's' : ''}
                    </span>
                    {req.reason && (
                      <span style={{ fontSize:12, color:c.textFaint }}>{req.reason}</span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px',
                  borderRadius:20, background:cfg.bg, border:`1px solid ${cfg.border}`, flexShrink:0 }}>
                  <SIcon size={13} style={{ color:cfg.color }} />
                  <span style={{ fontSize:12, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default ApplyLeave;