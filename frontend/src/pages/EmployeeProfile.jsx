import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, IdCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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

  if (loading) return <div className="text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] p-8">Loading profile...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  const StatusIcon = employee.status === 'Active' ? CheckCircle2 : employee.status === 'On Leave' ? Clock : AlertCircle;
  const statusColors = {
    'Active': 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    'On Leave': 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    'Resigned': 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/employees')}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Directory
      </button>

      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1 shadow-lg flex-shrink-0">
              {employee.profile_image ? (
                <img src={employee.profile_image} alt={employee.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-full bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-3xl font-bold tracking-tighter text-blue-600 dark:text-blue-400">
                  {employee.name.charAt(0)}
                </div>
              )}
            </div>
            
            <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 mb-2 shadow-sm ${statusColors[employee.status]}`}>
              <StatusIcon size={16} />
              {employee.status}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize tracking-tight">{employee.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <IdCard size={16} />
              System ID: <span className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-sm">{employee.emp_id}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department / Company</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{employee.company}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-start gap-4">
              <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Created</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                  {new Date(employee.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
