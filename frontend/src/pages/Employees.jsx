import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search, Plus, Download, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useEmployees } from '../context/EmployeeContext';

const Employees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { employees, loading, refreshEmployees } = useEmployees();
  
  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    status: 'Active',
    profile_image: ''
  });

  const handleExport = async () => {
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        refreshEmployees();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const openModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        name: emp.name,
        company: emp.company,
        status: emp.status,
        profile_image: emp.profile_image || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', company: '', status: 'Active', profile_image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.emp_id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      closeModal();
      refreshEmployees();
    } catch (error) {
      console.error('Form submit failed', error);
      alert('Operation failed. Please check inputs.');
    }
  };

  // Filtering
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your team members and access controls.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
            />
          </div>
          
          {isAdmin && (
            <>
              <button onClick={handleExport} className="btn-primary bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 h-[42px] px-3 shadow-sm">
                <Download size={18} />
              </button>
              <button onClick={() => openModal()} className="btn-primary h-[42px] px-4 shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                <Plus size={18} className="mr-1" /> Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">Employee</th>
                <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">ID</th>
                <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">Department/Company</th>
                <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-4 px-6 font-medium text-sm text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500">Loading employees...</td></tr>
              ) : currentEmployees.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500">No employees found.</td></tr>
              ) : (
                currentEmployees.map((emp) => (
                  <tr key={emp.emp_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shadow-sm">
                          {emp.profile_image ? (
                            <img src={emp.profile_image} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            emp.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-600 dark:text-gray-300 font-mono tracking-tight">{emp.emp_id}</td>
                    <td className="py-3 px-6 text-gray-600 dark:text-gray-300">{emp.company}</td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                        emp.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          emp.status === 'Active' ? 'bg-emerald-500' : 
                          emp.status === 'On Leave' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/employees/${emp.emp_id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <Eye size={16} />
                        </Link>
                        {isAdmin && (
                          <>
                            <button onClick={() => openModal(emp)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(emp.emp_id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
            </span>
            <div className="flex space-x-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => c - 1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md text-sm disabled:opacity-50 dark:text-gray-300"
              >
                Previous
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => c + 1)}
                className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-md text-sm disabled:opacity-50 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company / Department Name</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="input-field"
                  placeholder="e.g. Google, Microsoft, HR, Engineering"
                />
                {!editingEmployee && (
                   <p className="text-xs text-gray-500 mt-1">Smart ID will be generated using the first 3 letters.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input-field"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.profile_image}
                  onChange={(e) => setFormData({...formData, profile_image: e.target.value})}
                  className="input-field"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-6 py-2">
                  {editingEmployee ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
