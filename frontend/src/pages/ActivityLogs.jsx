import React, { useState, useEffect } from 'react';
import { Activity, Clock } from 'lucide-react';
import api from '../services/api';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="text-blue-500" /> System Activity Logs
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track all administrative actions across the platform.</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading logs...</div>
        ) : logs.length === 0 ? (
           <div className="p-8 text-center text-gray-500">No recent activity detected.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className={`p-2 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                    log.action.includes('added') ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    log.action.includes('deleted') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-semibold">{log.admin_name}</span> {log.action.toLowerCase()}{' '}
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{log.employee_id}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap sm:pl-4">
                  <Clock size={14} />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
