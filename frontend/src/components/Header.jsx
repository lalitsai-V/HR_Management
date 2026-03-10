import React from 'react';
import { Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header
      className="h-16 flex items-center justify-end px-8 sticky top-0 z-10 transition-colors duration-200"
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
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button
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
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#7c3aed', boxShadow: '0 0 0 2px ' + (isDarkMode ? '#161d2f' : '#fff') }}
          />
        </button>

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