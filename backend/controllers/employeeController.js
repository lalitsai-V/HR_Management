import { supabase } from '../config/supabase.js';
import { createObjectCsvStringifier } from 'csv-writer';

// Log activity helper
const logActivity = async (adminName, action, employeeId) => {
  try {
    await supabase.from('activity_logs').insert([{
      admin_name: adminName,
      action,
      employee_id: employeeId
    }]);
  } catch (err) {
    console.error('Failed to log activity', err);
  }
};

export const getEmployees = async (req, res) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyEmployee = async (req, res) => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('emp_id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const {
    name,
    email,
    company,
    status,
    profile_image,
    phone,
    department,
    designation,
    date_of_joining,
    aadhaar,
    pan,
    bank_name,
    ifsc_code,
    branch_name,
    account_number,
    salary,
    aadhaar_doc,
    user_id: providedUserId,
  } = req.body;

  if (company !== 'VaisoVerse Technology' && company !== 'We Marketing Experts') {
    return res.status(400).json({ message: 'Invalid company selection.' });
  }

  try {
    // Generate Smart ID based on company
    const prefix = company === 'VaisoVerse Technology' ? 'VV' : 'WME';
    const numDigits = company === 'VaisoVerse Technology' ? 4 : 3;

    // Find highest existing ID with this prefix
    const { data: existingIds, error: searchError } = await supabase
      .from('employees')
      .select('emp_id')
      .ilike('emp_id', `${prefix}%`);

    if (searchError) throw searchError;

    let nextNumber = 1;
    if (existingIds && existingIds.length > 0) {
      const numbers = existingIds.map(e => parseInt(e.emp_id.replace(prefix, ''))).filter(n => !isNaN(n));
      if (numbers.length > 0) {
         nextNumber = Math.max(...numbers) + 1;
      }
    }

    const emp_id = `${prefix}${nextNumber.toString().padStart(numDigits, '0')}`;

    const user_id = req.user.role === 'admin' ? providedUserId : req.user.id;

    // Prevent duplicate employee record for the same user
    if (user_id) {
      const { data: existing, error: existingError } = await supabase
        .from('employees')
        .select('emp_id')
        .eq('user_id', user_id)
        .maybeSingle();

      if (existing && !existingError) {
        return res.status(400).json({ message: 'Employee profile already exists for this user' });
      }
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .insert([{
        emp_id,
        name,
        email: email || req.user.email,
        company,
        status: status || 'Active',
        profile_image,
        phone,
        department,
        designation,
        date_of_joining,
        aadhaar,
        pan,
        bank_name,
        ifsc_code,
        branch_name,
        account_number,
        salary,
        aadhaar_doc,
        user_id,
      }])
      .select('*')
      .single();

    if (error) throw error;

    await logActivity(req.user.name, 'Employee added', emp_id);
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  const {
    name,
    email,
    company,
    status,
    profile_image,
    phone,
    department,
    designation,
    date_of_joining,
    aadhaar,
    pan,
    bank_name,
    ifsc_code,
    branch_name,
    account_number,
    salary,
    aadhaar_doc,
  } = req.body;

  if (company !== 'VaisoVerse Technology' && company !== 'We Marketing Experts') {
    return res.status(400).json({ message: 'Invalid company selection.' });
  }

  try {
    const empId = req.params.id;

    const employeeQuery = supabase.from('employees').select('*');
    const { data: existingEmployee, error: fetchError } = empId
      ? await employeeQuery.eq('emp_id', empId).maybeSingle()
      : await employeeQuery.eq('user_id', req.user.id).maybeSingle();

    if (fetchError) throw fetchError;
    if (!existingEmployee) return res.status(404).json({ message: 'Employee not found' });

    // Only admin or owner can update
    if (req.user.role !== 'admin' && existingEmployee.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        name,
        email,
        company,
        status,
        profile_image,
        phone,
        department,
        designation,
        date_of_joining,
        aadhaar,
        pan,
        bank_name,
        ifsc_code,
        branch_name,
        account_number,
        salary,
        aadhaar_doc,
      })
      .eq('emp_id', existingEmployee.emp_id)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    await logActivity(req.user.name, 'Employee edited', req.params.id);
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .delete()
      .eq('emp_id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await logActivity(req.user.name, 'Employee deleted', req.params.id);
    res.json({ message: 'Employee removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportEmployees = async (req, res) => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'S.No' },
        { id: 'emp_id', title: 'EmpID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'company', title: 'Company' },
        { id: 'department', title: 'Department' },
        { id: 'designation', title: 'Designation' },
        { id: 'date_of_joining', title: 'Date of Joining' },
        { id: 'aadhaar', title: 'Aadhaar No.' },
        { id: 'pan', title: 'PAN No.' },
        { id: 'bank_name', title: 'Bank Name' },
        { id: 'ifsc_code', title: 'IFSC Code' },
        { id: 'branch_name', title: 'Branch Name' },
        { id: 'account_number', title: 'Account No.' },
        { id: 'salary', title: 'Salary' },
        { id: 'status', title: 'Status' },
        { id: 'created_at', title: 'Created At' }
      ]
    });

    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(employees);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
