import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Bell, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Header = ({ toggleSidebar }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  // ... rest existing state
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notificationsRead') || '[]'); } catch { return []; }
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/leave-requests');
        setNotifications(data || []);
      } catch (err) {
        // ignore errors for now
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pending = notifications.filter((n) => n.status === 'pending');
  const unreadCount = pending.filter((n) => !readIds.includes(n.id)).length;

  const markAllRead = () => {
    const ids = pending.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...ids]));
    setReadIds(updated);
    localStorage.setItem('notificationsRead', JSON.stringify(updated));
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) markAllRead();
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 transition-colors duration-200"
      style={{
        background: isDarkMode
          ? 'rgba(22, 29, 47, 0.85)'
          : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isDarkMode
          ? '1px solid rgba(255,255,255,0.05)'
          : '1px solid rgba(15,23,42,0.07)',
      }}
    >
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
        style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 ml-auto" ref={dropdownRef}>
        {/* Notification Bell */}
        <button
          onClick={toggleOpen}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
          style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.05)';
            e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDarkMode ? '#8892a4' : '#64748b';
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: '#7c3aed', boxShadow: '0 0 0 2px ' + (isDarkMode ? '#161d2f' : '#fff') }}
            />
          )}
        </button>

        {open && (
          <div
            className="absolute top-16 right-8 w-72 rounded-xl shadow-lg overflow-hidden"
            style={{
              background: isDarkMode ? '#0f172a' : '#ffffff',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.12)',
              zIndex: 30,
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)' }}>
              <div className="flex items-center justify-between">
                <span className="font-semibold" style={{ color: isDarkMode ? '#e2e8f0' : '#0f172a' }}>
                  Notifications
                </span>
                <button
                  className="text-xs"
                  style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }}>
                {unreadCount ? `${unreadCount} new` : 'No new notifications'}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm" style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => {
                  const isUnread = !readIds.includes(n.id) && n.status === 'pending';
                  return (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b last:border-b-0"
                      style={{
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.12)',
                        background: isUnread ? (isDarkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)') : 'transparent',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: isDarkMode ? '#e2e8f0' : '#0f172a' }}>
                          {n.leave_type || 'Leave Request'}
                        </span>
                        <span className="text-xs" style={{ color: isDarkMode ? '#64748b' : '#94a3b8' }}>
                          {n.status}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}>
                        {n.from_date} → {n.to_date}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          className="w-px h-5 mx-1"
          style={{ background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)' }}
        />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
          style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.05)';
            e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDarkMode ? '#8892a4' : '#64748b';
          }}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

export default Header;