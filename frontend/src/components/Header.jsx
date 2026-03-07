import React from 'react';
import { Search, Moon, Sun, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
      <div className="w-96 flex items-center relative">
        <Search className="absolute left-3 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search something..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm rounded-full border-none focus:ring-2 focus:ring-blue-500 outline-none text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] transition-colors duration-200"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell size={20} />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
