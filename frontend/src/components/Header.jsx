import React from 'react';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header
      className="h-16 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200"
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
      {/* Search */}
      <div className="relative w-80">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          size={16}
          style={{ color: isDarkMode ? '#8892a4' : '#94a3b8' }}
        />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl outline-none transition-all duration-200"
          style={{
            background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f2f4f9',
            border: isDarkMode
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(15,23,42,0.08)',
            color: isDarkMode ? '#e2e8f0' : '#0f172a',
            fontFamily: 'DM Sans, sans-serif',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.3)';
            e.target.style.borderColor = 'rgba(124,58,237,0.4)';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = isDarkMode
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(15,23,42,0.08)';
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
          style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(15,23,42,0.05)';
            e.currentTarget.style.color = isDarkMode ? '#e2e8f0' : '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDarkMode ? '#8892a4' : '#64748b';
          }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#7c3aed', boxShadow: '0 0 0 2px ' + (isDarkMode ? '#161d2f' : '#fff') }}
          />
        </button>

        {/* Divider */}
        <div
          className="w-px h-5 mx-1"
          style={{
            background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.1)',
          }}
        />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
          style={{ color: isDarkMode ? '#8892a4' : '#64748b' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(15,23,42,0.05)';
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