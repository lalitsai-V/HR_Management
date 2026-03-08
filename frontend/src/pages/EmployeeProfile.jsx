import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Calendar, IdCard,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import api from '../services/api';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        setEmployee(data);
      } catch (err) {
        setError('Employee not found or unauthorized');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
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

  if (error) {
    return (
      <div
        className="max-w-md mx-auto mt-12 p-6 rounded-2xl text-center"
        style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  const STATUS_CONFIG = {
    Active: { icon: CheckCircle2, dot: '#10b981', text: '#059669', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    'On Leave': { icon: Clock, dot: '#f59e0b', text: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    Resigned: { icon: AlertCircle, dot: '#ef4444', text: '#dc2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  };

  const cfg = STATUS_CONFIG[employee.status] || STATUS_CONFIG['Active'];
  const StatusIcon = cfg.icon;

  return (
    <div
      className="max-w-3xl mx-auto space-y-5"
      style={{ fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Back */}
      <button
        onClick={() => navigate('/employees')}
        className="flex items-center gap-2 text-sm font-medium transition-colors duration-150"
        style={{ color: '#94a3b8' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#7c3aed'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
      >
        <ArrowLeft size={16} />
        Back to Directory
      </button>

      {/* Profile card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div
          className="h-36 relative"
          style={{
            background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 40%, #0f172a 100%)',
          }}
        >
          {/* Decorative circles on banner */}
          <div
            className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-20px] left-20 w-32 h-32 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="px-7 pb-7">
          {/* Avatar row */}
          <div className="flex justify-between items-end -mt-10 mb-5">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                border: '3px solid var(--color-surface-light)',
                boxShadow: '0 8px 24px rgba(124,58,237,0.25)',
              }}
            >
              {employee.profile_image ? (
                <img
                  src={employee.profile_image}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                >
                  {employee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Status badge */}
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-1"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.text,
              }}
            >
              <StatusIcon size={13} />
              {employee.status}
            </span>
          </div>

          {/* Name & ID */}
          <div className="mb-7">
            <h1
              className="text-2xl font-bold text-gray-900 dark:text-white capitalize"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {employee.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <IdCard size={14} style={{ color: '#94a3b8' }} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Employee ID:{' '}
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded-lg"
                  style={{
                    background: 'rgba(124,58,237,0.07)',
                    border: '1px solid rgba(124,58,237,0.12)',
                    color: '#7c3aed',
                  }}
                >
                  {employee.emp_id}
                </span>
              </span>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              icon={Building2}
              label="Department / Company"
              value={employee.company}
              accent="#7c3aed"
              accentBg="rgba(124,58,237,0.08)"
            />
            <InfoCard
              icon={Calendar}
              label="Profile Created"
              value={new Date(employee.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              accent="#4f46e5"
              accentBg="rgba(79,70,229,0.08)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, accent, accentBg }) => (
  <div
    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200"
    style={{
      background: 'rgba(148,163,184,0.04)',
      border: '1px solid var(--color-border-light)',
    }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: accentBg }}
    >
      <Icon size={20} style={{ color: accent }} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default EmployeeProfile;