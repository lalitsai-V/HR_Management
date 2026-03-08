import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search, Plus, Download, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useEmployees } from '../context/EmployeeContext';

const STATUS_CONFIG = {
  Active:     { dot: '#10b981', text: '#059669', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
  'On Leave': { dot: '#f59e0b', text: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  Resigned:   { dot: '#ef4444', text: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Active'];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
};

const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
    {children}
  </label>
);

const Employees = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { employees, loading, refreshEmployees } = useEmployees();

  const [searchQuery, setSearchQuery]         = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const itemsPerPage                          = 10;
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData]               = useState({ name: '', company: '', status: 'Active', profile_image: '' });

  const handleExport = async () => {
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
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
      setFormData({ name: emp.name, company: emp.company, status: emp.status, profile_image: emp.profile_image || '' });
    } else {
      setEditingEmployee(null);
      setFormData({ name: '', company: '', status: 'Active', profile_image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingEmployee(null); };

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

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.emp_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages       = Math.ceil(filteredEmployees.length / itemsPerPage);
  const currentEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2.5"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
              <Users size={17} style={{ color: '#7c3aed' }} />
            </div>
            Employee Directory
          </h1>
          <p className="text-sm mt-1 ml-10" style={{ color: 'var(--color-text-muted-light)' }}>
            Manage and view all team members
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={15} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
              style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', color: 'var(--color-text-light)', fontFamily: 'DM Sans, sans-serif' }}
              onFocus={(e) => { e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.25)'; e.target.style.borderColor = 'rgba(124,58,237,0.35)'; }}
              onBlur={(e)  => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-light)'; }}
            />
          </div>

          {isAdmin && (
            <>
              <button
                onClick={handleExport}
                title="Export CSV"
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0"
                style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', color: '#64748b' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = '#7c3aed'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-light)'; e.currentTarget.style.color = '#64748b'; }}
              >
                <Download size={16} />
              </button>
              <button onClick={() => openModal()} className="btn-primary h-10 px-4 flex-shrink-0" style={{ fontSize: '13px' }}>
                <Plus size={15} /> Add Employee
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'rgba(124,58,237,0.03)', borderBottom: '1px solid var(--color-border-light)' }}>
                {['Employee', 'ID', 'Department', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 px-5 text-xs font-semibold uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}
                    style={{ color: '#94a3b8' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex justify-center gap-1.5">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full"
                          style={{ background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ) : currentEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center text-sm" style={{ color: '#94a3b8' }}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                currentEmployees.map((emp) => (
                  <tr
                    key={emp.emp_id}
                    className="transition-colors duration-150"
                    style={{ borderBottom: '1px solid var(--color-border-light)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.025)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0"
                          style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}
                        >
                          {emp.profile_image
                            ? <img src={emp.profile_image} alt={emp.name} className="w-full h-full object-cover" />
                            : emp.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                          {emp.name}
                        </span>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)', color: '#64748b' }}>
                        {emp.emp_id}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-5 text-sm" style={{ color: 'var(--color-text-muted-light)' }}>
                      {emp.company}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <StatusBadge status={emp.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/employees/${emp.emp_id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                          style={{ color: '#94a3b8' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; e.currentTarget.style.color = '#7c3aed'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <Eye size={15} />
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openModal(emp)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                              style={{ color: '#94a3b8' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(79,70,229,0.08)'; e.currentTarget.style.color = '#4f46e5'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.emp_id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                              style={{ color: '#94a3b8' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                              <Trash2 size={15} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              Showing{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-muted-light)' }}>
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}
              </span>
              {' '}of{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-muted-light)' }}>
                {filteredEmployees.length}
              </span>
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => c - 1)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', color: '#64748b' }}
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => c + 1)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', color: '#64748b' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
          >
            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-5" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  {editingEmployee ? <Edit size={16} style={{ color: '#7c3aed' }} /> : <Plus size={16} style={{ color: '#7c3aed' }} />}
                </div>
                <h2 className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--color-text-light)' }}>
                  {editingEmployee ? 'Edit Employee' : 'New Employee'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                style={{ color: '#94a3b8' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(148,163,184,0.1)'; e.currentTarget.style.color = '#64748b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field" placeholder="e.g. Jane Doe" />
              </div>

              <div>
                <FieldLabel>Company / Department</FieldLabel>
                <input type="text" required value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field" placeholder="e.g. Engineering, HR, Marketing" />
                {!editingEmployee && (
                  <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>
                    Smart ID will be generated using the first 3 letters.
                  </p>
                )}
              </div>

              <div>
                <FieldLabel>Status</FieldLabel>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field appearance-none cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                </select>
              </div>

              <div>
                <FieldLabel>
                  Profile Image URL{' '}
                  <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                </FieldLabel>
                <input type="url" value={formData.profile_image}
                  onChange={(e) => setFormData({ ...formData, profile_image: e.target.value })}
                  className="input-field" placeholder="https://example.com/photo.jpg" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
                  style={{ color: '#64748b', background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                  {editingEmployee ? 'Save Changes' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Employees;