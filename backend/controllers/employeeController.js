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

export const getEmployeeById = async (req, res) => {
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('emp_id', req.params.id)
      .single();

    if (error) throw error;
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  const { name, company, status, profile_image } = req.body;
  try {
    // Generate Smart ID
    const prefix = company.substring(0, 3).toUpperCase();
    
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

    const emp_id = `${prefix}${nextNumber.toString().padStart(3, '0')}`;

    const { data: employee, error } = await supabase
      .from('employees')
      .insert([{ emp_id, name, company, status: status || 'Active', profile_image }])
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
  const { name, company, status, profile_image } = req.body;
  try {
    const { data: employee, error } = await supabase
      .from('employees')
      .update({ name, company, status, profile_image })
      .eq('emp_id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

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
      .single();

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
        { id: 'emp_id', title: 'EmpID' },
        { id: 'name', title: 'Name' },
        { id: 'company', title: 'Company' },
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
