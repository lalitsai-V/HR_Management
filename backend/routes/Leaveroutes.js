import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  const { employee_name, leave_type, from_date, to_date, total_days, reason, description } = req.body;
  try {
    let emp_id = null;
    const { data: empData } = await supabase
      .from('employees').select('emp_id').eq('user_id', req.user.id).single();
    emp_id = empData?.emp_id || null;

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{ user_id: req.user.id, employee_name, emp_id, leave_type, from_date, to_date, total_days, reason, description, status: 'pending' }])
      .select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create leave request' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let query = supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
    if (req.user.role !== 'admin') query = query.eq('user_id', req.user.id);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});

router.patch('/:id', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  try {
    const { data, error } = await supabase
      .from('leave_requests').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update leave request' });
  }
});

export default router;