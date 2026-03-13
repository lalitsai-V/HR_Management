import React, { useState } from 'react';
import { Eye, Edit, Trash2, Search, Plus, Download, X, Users, RefreshCw } from 'lucide-react';
import useAuth from '../context/useAuth';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useEmployees from '../context/useEmployees';

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
  const [formData, setFormData]               = useState({
    name: '',
    company: 'VaisoVerse Technology',
    status: 'Active',
    profile_image: '',
    leave_balance: 12,
    phone: '',
    department: '',
    designation: '',
    date_of_joining: '',
    aadhaar: '',
    pan: '',
    bank_name: '',
    ifsc_code: '',
    branch_name: '',
    account_number: '',
    salary: '',
    aadhaar_doc: '',
  });

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

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
      setFormData({
        name: emp.name,
        company: emp.company,
        status: emp.status,
        profile_image: emp.profile_image || '',
        leave_balance: emp.leave_balance ?? 12,
        phone: emp.phone || '',
        department: emp.department || '',
        designation: emp.designation || '',
        date_of_joining: emp.date_of_joining ? emp.date_of_joining.split('T')[0] : '',
        aadhaar: emp.aadhaar || '',
        pan: emp.pan || '',
        bank_name: emp.bank_name || '',
        ifsc_code: emp.ifsc_code || '',
        branch_name: emp.branch_name || '',
        account_number: emp.account_number || '',
        salary: emp.salary || '',
        aadhaar_doc: emp.aadhaar_doc || '',
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        company: 'VaisoVerse Technology',
        status: 'Active',
        profile_image: '',
        leave_balance: 12,
        phone: '',
        department: '',
        designation: '',
        date_of_joining: '',
        aadhaar: '',
        pan: '',
        bank_name: '',
        ifsc_code: '',
        branch_name: '',
        account_number: '',
        salary: '',
        aadhaar_doc: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingEmployee(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData };

    try {
      // If user selected a file for profile_image or aadhaar_doc, convert to base64
      if (payload.profile_image instanceof File) {
        payload.profile_image = await toBase64(payload.profile_image);
      }
      if (payload.aadhaar_doc instanceof File) {
        payload.aadhaar_doc = await toBase64(payload.aadhaar_doc);
      }

      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.emp_id}`, payload);
      } else {
        await api.post('/employees', payload);
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
                onClick={() => refreshEmployees()}
                title="Refresh data"
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0"
                style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', color: '#64748b' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; e.currentTarget.style.color = '#7c3aed'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-light)'; e.currentTarget.style.color = '#64748b'; }}
              >
                <RefreshCw size={16} />
              </button>
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
                {['No.', 'Employee', 'ID', 'Company', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3.5 px-5 text-xs font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}
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
                            ? <img
                                src={emp.profile_image}
                                alt={emp.name}
                                className="w-full h-full"
                                style={{ objectFit: 'contain', objectPosition: 'center' }}
                              />
                            : emp.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                          {emp.name}
                        </span>
                      </div>
                    </td>

                    {/* Normal ID */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-lg"
                        style={{ color: '#64748b' }}>
                        {emp.id || '-'}
                      </span>
                    </td>

                    {/* Emp ID */}
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
            className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border-light)', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', maxHeight: '90vh' }}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ flex: 1 }}>
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field" placeholder="e.g. Jane Doe" />
              </div>

              <div>
                <FieldLabel>Company</FieldLabel>
                <select 
                  required 
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="VaisoVerse Technology">VaisoVerse Technology</option>
                  <option value="We Marketing Experts">We Marketing Experts</option>
                </select>
                {!editingEmployee && (
                  <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>
                    Prefix VV0001 or WME001 will be used based on selected company.
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
                <FieldLabel>Leave Balance (days)</FieldLabel>
                <input
                  type="number"
                  min={0}
                  value={formData.leave_balance ?? 0}
                  onChange={(e) => setFormData({ ...formData, leave_balance: Number(e.target.value) })}
                  className="input-field"
                  placeholder="12"
                />
              </div>

              <div>
                <FieldLabel>
                  Profile Image (Optional)
                </FieldLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFormData((prev) => ({ ...prev, profile_image: file }));
                  }}
                  className="input-field"
                />
                {formData.profile_image && typeof formData.profile_image === 'string' && (
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    Current image is already set.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: '#64748b' }}>
                  Additional details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Phone</FieldLabel>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                      placeholder="e.g. +1 555 123 4567"
                    />
                  </div>
                  <div>
                    <FieldLabel>Date of Joining</FieldLabel>
                    <input
                      type="date"
                      value={formData.date_of_joining}
                      onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FieldLabel>Aadhaar No</FieldLabel>
                    <input
                      type="text"
                      value={formData.aadhaar}
                      onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                      className="input-field"
                      placeholder="1234 5678 9012"
                    />
                  </div>
                  <div>
                    <FieldLabel>PAN No</FieldLabel>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="input-field"
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FieldLabel>Bank Name</FieldLabel>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="input-field"
                      placeholder="e.g. State Bank"
                    />
                  </div>
                  <div>
                    <FieldLabel>IFSC Code</FieldLabel>
                    <input
                      type="text"
                      value={formData.ifsc_code}
                      onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                      className="input-field"
                      placeholder="e.g. SBIN0001234"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FieldLabel>Branch</FieldLabel>
                    <input
                      type="text"
                      value={formData.branch_name}
                      onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Main Branch"
                    />
                  </div>
                  <div>
                    <FieldLabel>Account Number</FieldLabel>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <FieldLabel>Salary</FieldLabel>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="input-field"
                      placeholder="e.g. 50000"
                    />
                  </div>
                  <div>
                    <FieldLabel>Aadhaar Document (Optional)</FieldLabel>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setFormData((prev) => ({ ...prev, aadhaar_doc: file }));
                      }}
                      className="input-field"
                    />
                    {formData.aadhaar_doc && typeof formData.aadhaar_doc === 'string' && (
                      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                        Document uploaded.
                      </p>
                    )}
                  </div>
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