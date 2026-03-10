import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get current user's attendance for a given month (YYYY-MM)
router.get('/me', protect, async (req, res) => {
  const { month } = req.query; // expected format: YYYY-MM

  try {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Invalid or missing month. Use format YYYY-MM.' });
    }

    const [year, monthNum] = month.split('-').map(Number);
    const fromDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const toDate = new Date(Date.UTC(year, monthNum, 0)); // last day of month

    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('user_id', req.user.id)
      .gte('date', fromDate.toISOString().slice(0, 10))
      .lte('date', toDate.toISOString().slice(0, 10))
      .order('date', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error('Failed to fetch attendance', err);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Admin: get attendance for all employees on a specific date (YYYY-MM-DD)
router.get('/', protect, adminOnly, async (req, res) => {
  const { date } = req.query;

  try {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid or missing date. Use format YYYY-MM-DD.' });
    }

    const { data: rows, error } = await supabase
      .from('attendance')
      .select('id, user_id, emp_id, date, status')
      .eq('date', date)
      .order('emp_id', { ascending: true });

    if (error) throw error;

    res.json(rows || []);
  } catch (err) {
    console.error('Failed to fetch attendance list', err);
    res.status(500).json({ message: 'Failed to fetch attendance list' });
  }
});

// Admin: mark attendance (create or update) for a user/employee on a given date
router.post('/mark', protect, adminOnly, async (req, res) => {
  const { user_id, emp_id, date, status } = req.body;

  try {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid or missing date. Use format YYYY-MM-DD.' });
    }

    if (!['present', 'absent', 'late'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use present, absent, or late.' });
    }

    if (!user_id && !emp_id) {
      return res.status(400).json({ message: 'user_id or emp_id is required.' });
    }

    // If only emp_id is provided, look up user_id from employees table
    let resolvedUserId = user_id;
    let resolvedEmpId = emp_id;

    if (!resolvedUserId && resolvedEmpId) {
      const { data: emp, error: empError } = await supabase
        .from('employees')
        .select('user_id, emp_id')
        .eq('emp_id', resolvedEmpId)
        .maybeSingle();

      if (empError) throw empError;
      if (emp) {
        resolvedUserId = emp.user_id;
        resolvedEmpId = emp.emp_id;
      }
    }

    if (!resolvedUserId) {
      return res.status(400).json({ message: 'Could not resolve user for attendance record.' });
    }

    // Upsert logic: check if a record already exists for this user/date
    const { data: existing, error: fetchError } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', resolvedUserId)
      .eq('date', date)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let result;

    if (existing) {
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, emp_id: resolvedEmpId, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          user_id: resolvedUserId,
          emp_id: resolvedEmpId,
          date,
          status
        }])
        .select('*')
        .maybeSingle();

      if (error) throw error;
      result = data;
    }

    res.status(200).json(result);
  } catch (err) {
    console.error('Failed to mark attendance', err);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

export default router;

