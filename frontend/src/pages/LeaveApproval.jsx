import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const STATUS_CFG = {
  pending:  { color:'#f59e0b', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.2)',  label:'Pending',  icon:Clock        },
  approved: { color:'#10b981', bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.2)',  label:'Approved', icon:CheckCircle2 },
  rejected: { color:'#ef4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.2)',   label:'Rejected', icon:XCircle      },
};

const LeaveApproval = () => {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const c = {
    textPrimary: isDarkMode ? '#e2e8f0' : '#0f172a',
    textMuted:   isDarkMode ? '#8892a4' : '#64748b',
    textFaint:   isDarkMode ? '#64748b' : '#94a3b8',
    border:      isDarkMode ? '#1e2d45' : '#e2e8f2',
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/leave-requests');
      setRequests(data || []);
    } catch (err) {
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/leave-requests/${id}`, { status });
      setRequests(r => r.map(x => x.id === id ? {...x, status} : x));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filtered      = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6" style={{ fontFamily:'DM Sans,sans-serif' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5"
            style={{ fontFamily:'Outfit,sans-serif', color:c.textPrimary }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'rgba(124,58,237,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FileText size={17} style={{ color:'#7c3aed' }} />
            </div>
            Leave Approvals
          </h1>
          <p className="text-sm mt-1 ml-10" style={{ color:c.textMuted }}>
            Review and manage employee leave requests
          </p>
        </div>
        <button onClick={fetchRequests}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
            fontSize:13, fontWeight:500, cursor:'pointer', color:'#7c3aed',
            background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label:'Approved', value:approvedCount, color:'#10b981', bg:'rgba(16,185,129,0.08)',  icon:CheckCircle2 },
          { label:'Rejected', value:rejectedCount, color:'#ef4444', bg:'rgba(239,68,68,0.08)',   icon:XCircle      },
        ].map(({ label, value, color, bg, icon:Icon }) => (
          <div key={label} className="card p-4" style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:bg,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize:12, color:c.textFaint }}>{label}</p>
              <p style={{ fontSize:22, fontWeight:700, color:c.textPrimary, fontFamily:'Outfit,sans-serif' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8 }}>
        {['all','approved','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:'6px 16px', borderRadius:10, fontSize:13, fontWeight:500,
              cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize',
              background: filter===f ? 'rgba(124,58,237,0.12)' : 'transparent',
              color: filter===f ? '#7c3aed' : c.textMuted,
              border: filter===f ? '1px solid rgba(124,58,237,0.25)' : `1px solid ${c.border}` }}>
            {f === 'all' ? 'All Requests' : f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div style={{ padding:'48px 24px', textAlign:'center', color:c.textFaint, fontSize:14 }}>
            Loading requests...
          </div>
        ) : error ? (
          <div style={{ padding:'48px 24px', textAlign:'center', color:'#ef4444', fontSize:14 }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'48px 24px', textAlign:'center', color:c.textFaint, fontSize:14 }}>
            No {filter === 'all' ? '' : filter} requests found.
          </div>
        ) : (
          filtered.map((req, idx) => {
            const cfg   = STATUS_CFG[req.status] || STATUS_CFG.pending;
            const SIcon = cfg.icon;
            return (
              <div key={req.id}
                style={{ display:'flex', alignItems:'center', gap:16, padding:'18px 24px',
                  borderBottom: idx < filtered.length-1 ? `1px solid ${c.border}` : 'none',
                  transition:'background 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDarkMode?'rgba(124,58,237,0.04)':'rgba(124,58,237,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Avatar */}
                <div style={{ width:40, height:40, borderRadius:12, flexShrink:0,
                  background:'rgba(124,58,237,0.12)', display:'flex', alignItems:'center',
                  justifyContent:'center', color:'#a78bfa', fontWeight:700, fontSize:15 }}>
                  {(req.employee_name || '?').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:600, color:c.textPrimary }}>{req.employee_name}</span>
                    {req.emp_id && (
                      <span style={{ fontSize:11, fontFamily:'monospace', padding:'1px 8px', borderRadius:6,
                        background: isDarkMode?'rgba(255,255,255,0.06)':'rgba(148,163,184,0.1)',
                        color:c.textMuted }}>{req.emp_id}</span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:4, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'#7c3aed', fontWeight:500 }}>{req.leave_type}</span>
                    <span style={{ fontSize:12, color:c.textFaint }}>
                      {req.from_date} → {req.to_date} ·{' '}
                      <b style={{ color:c.textMuted }}>{req.total_days} day{req.total_days>1?'s':''}</b>
                    </span>
                    {req.reason && <span style={{ fontSize:12, color:c.textFaint }}>{req.reason}</span>}
                  </div>
                </div>

                {/* Status badge */}
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px',
                  borderRadius:20, background:cfg.bg, border:`1px solid ${cfg.border}`, flexShrink:0 }}>
                  <SIcon size={13} style={{ color:cfg.color }} />
                  <span style={{ fontSize:12, fontWeight:600, color:cfg.color }}>{cfg.label}</span>
                </div>

                {/* Action buttons — only for pending */}
                {req.status === 'pending' && (
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button onClick={() => updateStatus(req.id, 'approved')}
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px',
                        borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer',
                        background:'rgba(16,185,129,0.1)', color:'#10b981',
                        border:'1px solid rgba(16,185,129,0.25)', transition:'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background='rgba(16,185,129,0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background='rgba(16,185,129,0.1)'; }}>
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button onClick={() => updateStatus(req.id, 'rejected')}
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px',
                        borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer',
                        background:'rgba(239,68,68,0.08)', color:'#ef4444',
                        border:'1px solid rgba(239,68,68,0.2)', transition:'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.18)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}>
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeaveApproval;