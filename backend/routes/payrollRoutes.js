import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to ensure numeric fields
const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

// GET /api/payroll/me - current user's payroll records
router.get('/me', protect, async (req, res) => {
  try {
    // Find employee record for this user
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('emp_id')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (empError) throw empError;
    if (!emp) {
      return res.json([]);
    }

    const { data, error } = await supabase
      .from('payroll')
      .select('id, emp_id, month, basic_salary, allowances, deductions, net_pay, payment_date, status')
      .eq('emp_id', emp.emp_id)
      .order('month', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('Failed to fetch my payroll', err);
    res.status(500).json({ message: 'Failed to fetch payroll records' });
  }
});

// GET /api/payroll - admin list payrolls (optional filters: month, emp_id)
router.get('/', protect, adminOnly, async (req, res) => {
  const { month, emp_id } = req.query;

  try {
    let query = supabase
      .from('payroll')
      .select('id, emp_id, month, basic_salary, allowances, deductions, net_pay, payment_date, status')
      .order('month', { ascending: false })
      .order('emp_id', { ascending: true });

    if (month) {
      query = query.eq('month', month);
    }
    if (emp_id) {
      query = query.eq('emp_id', emp_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('Failed to fetch payroll list', err);
    res.status(500).json({ message: 'Failed to fetch payroll list' });
  }
});

// POST /api/payroll - admin create or update payroll for an employee & month
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      emp_id,
      month,
      basic_salary,
      allowances = 0,
      deductions = 0,
      net_pay,
      payment_date,
      status = 'finalized',
    } = req.body;

    if (!emp_id || !month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'emp_id and valid month (YYYY-MM) are required.' });
    }

    const basic = toNumber(basic_salary, NaN);
    const allow = toNumber(allowances, 0);
    const deduct = toNumber(deductions, 0);

    if (!Number.isFinite(basic)) {
      return res.status(400).json({ message: 'basic_salary must be a valid number.' });
    }

    const computedNet = Number.isFinite(toNumber(net_pay))
      ? toNumber(net_pay)
      : basic + allow - deduct;

    // Ensure employee exists
    const { data: emp, error: empError } = await supabase
      .from('employees')
      .select('emp_id')
      .eq('emp_id', emp_id)
      .maybeSingle();

    if (empError) throw empError;
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Check if payroll already exists for this emp/month
    const { data: existing, error: fetchError } = await supabase
      .from('payroll')
      .select('id')
      .eq('emp_id', emp_id)
      .eq('month', month)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('payroll')
        .update({
          basic_salary: basic,
          allowances: allow,
          deductions: deduct,
          net_pay: computedNet,
          payment_date: payment_date || null,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('payroll')
        .insert([
          {
            emp_id,
            month,
            basic_salary: basic,
            allowances: allow,
            deductions: deduct,
            net_pay: computedNet,
            payment_date: payment_date || null,
            status,
          },
        ])
        .select('*')
        .maybeSingle();

      if (error) throw error;
      result = data;
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Failed to upsert payroll', err);
    res.status(500).json({ message: 'Failed to save payroll record' });
  }
});

export default router;

