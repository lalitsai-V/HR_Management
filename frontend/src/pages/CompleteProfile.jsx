import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../services/api';

const COMPANY_OPTIONS = ['VaisoVerse Technology', 'We Marketing Experts'];

const CompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profile_image: '',
    phone: '',
    company: COMPANY_OPTIONS[0],
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/employees/me');
        setFormData((prev) => ({
          ...prev,
          ...data,
          salary: data.salary || '',
          date_of_joining: data.date_of_joining ? data.date_of_joining.split('T')[0] : '',
        }));
      } catch (err) {
        // If not found, user is on first-time setup path.
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.role !== 'admin') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Create or update based on whether we already have an emp_id
      const endpoint = formData.emp_id ? '/employees/me' : '/employees/me';
      const method = formData.emp_id ? 'put' : 'post';
      await api[method](endpoint, {
        ...formData,
        salary: formData.salary === '' ? null : formData.salary,
      });

      navigate('/');
    } catch (err) {
      console.error('CompleteProfile save error:', err);
      const backendMessage = err.response?.data?.message;
      const fallback = err.message || 'Failed to save profile';
      setError(backendMessage || fallback);
    } finally {
      setSaving(false);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const onChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const onFileChange = (field) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await toBase64(file);
      setFormData((prev) => ({ ...prev, [field]: base64 }));
    } catch (err) {
      console.error('File read failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background-light)' }}>
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

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Fill in the details below so your administrator can see your full profile.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={onChange('name')}
            className="input-field"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={onChange('email')}
            className="input-field"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange('profile_image')}
            className="input-field"
          />
          {formData.profile_image && (
            <p className="text-xs text-gray-500 mt-1">Photo selected (will be uploaded to the profile).</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={onChange('phone')}
            className="input-field"
            placeholder="+1 555 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <select
            required
            value={formData.company}
            onChange={onChange('company')}
            className="input-field appearance-none cursor-pointer"
          >
            {COMPANY_OPTIONS.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={onChange('department')}
              className="input-field"
              placeholder="e.g. Engineering"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={onChange('designation')}
              className="input-field"
              placeholder="e.g. Product Manager"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date of Joining</label>
          <input
            type="date"
            value={formData.date_of_joining}
            onChange={onChange('date_of_joining')}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Aadhaar No</label>
            <input
              type="text"
              value={formData.aadhaar}
              onChange={onChange('aadhaar')}
              className="input-field"
              placeholder="1234 5678 9012"
            />
            <label className="block text-sm font-medium mb-1 mt-3">Aadhaar Document</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={onFileChange('aadhaar_doc')}
              className="input-field"
            />
            {formData.aadhaar_doc && (
              <p className="text-xs text-gray-500 mt-1">Aadhaar document selected.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PAN No</label>
            <input
              type="text"
              value={formData.pan}
              onChange={onChange('pan')}
              className="input-field"
              placeholder="ABCDE1234F"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={onChange('bank_name')}
              className="input-field"
              placeholder="e.g. State Bank"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code</label>
            <input
              type="text"
              value={formData.ifsc_code}
              onChange={onChange('ifsc_code')}
              className="input-field"
              placeholder="e.g. SBIN0001234"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Branch Name</label>
            <input
              type="text"
              value={formData.branch_name}
              onChange={onChange('branch_name')}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              type="text"
              value={formData.account_number}
              onChange={onChange('account_number')}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Salary</label>
          <input
            type="number"
            value={formData.salary}
            onChange={onChange('salary')}
            className="input-field"
            placeholder="e.g. 50000"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            style={{ color: 'var(--color-text-muted-light)', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            Skip
          </button>
          <button type="submit" className="btn-primary px-5 py-2.5 text-sm" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompleteProfile;
