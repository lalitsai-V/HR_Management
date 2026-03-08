import React, { useState, useEffect } from 'react';
import { Activity, Clock, Plus, Trash2, Edit } from 'lucide-react';
import api from '../services/api';

const getActionMeta = (action) => {
  const a = action.toLowerCase();
  if (a.includes('added') || a.includes('created'))
    return { icon: Plus,    bg: 'rgba(16,185,129,0.09)',  border: 'rgba(16,185,129,0.18)',  iconColor: '#10b981' };
  if (a.includes('deleted') || a.includes('removed'))
    return { icon: Trash2,  bg: 'rgba(239,68,68,0.09)',   border: 'rgba(239,68,68,0.18)',   iconColor: '#ef4444' };
  return   { icon: Edit,    bg: 'rgba(124,58,237,0.09)',  border: 'rgba(124,58,237,0.18)',  iconColor: '#7c3aed' };
};

const ActivityLogs = () => {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/activity');
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch activity logs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatTime = (ts) =>
    new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2.5"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Activity size={17} style={{ color: '#7c3aed' }} />
            </div>
            Activity Logs
          </h1>
          <p className="text-sm mt-1 ml-10" style={{ color: 'var(--color-text-muted-light)' }}>
            Track all administrative actions across the platform
          </p>
        </div>

        {!loading && (
          <div
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)', color: '#7c3aed' }}
          >
            {logs.length} events
          </div>
        )}
      </div>

      {/* Logs card */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full"
                  style={{ background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(148,163,184,0.08)' }}>
              <Activity size={22} style={{ color: '#94a3b8' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#64748b' }}>No recent activity</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Actions will appear here once recorded</p>
          </div>
        ) : (
          logs.map((log) => {
            const meta       = getActionMeta(log.action);
            const ActionIcon = meta.icon;
            return (
              <div
                key={log.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors duration-150"
                style={{ borderBottom: '1px solid var(--color-border-light)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Action icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
                >
                  <ActionIcon size={16} style={{ color: meta.iconColor }} />
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    <span className="font-semibold">{log.admin_name}</span>
                    {' '}
                    <span style={{ color: 'var(--color-text-muted-light)' }}>{log.action.toLowerCase()}</span>
                    {' '}
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)', color: '#64748b' }}
                    >
                      {log.employee_id}
                    </span>
                  </p>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1.5 text-xs whitespace-nowrap flex-shrink-0" style={{ color: '#94a3b8' }}>
                  <Clock size={13} />
                  {formatTime(log.timestamp)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ActivityLogs;