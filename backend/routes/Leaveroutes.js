import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const isMissingColumnError = (err, column) => {
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  return msg.includes(column.toLowerCase()) && (msg.includes('could not find') || msg.includes('does not exist'));
};

const countWorkingDays = (fromDate, toDate) => {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

const formatISODate = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getLeaveDates = (fromDate, toDate) => {
  const dates = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return dates;

  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) {
      dates.push(formatISODate(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const upsertLeaveAttendance = async (userId, empId, fromDate, toDate) => {
  const dates = getLeaveDates(fromDate, toDate);
  if (!dates.length) return;

  const records = dates.map((date) => ({
    user_id: userId,
    emp_id: empId,
    date,
    status: 'leave',
  }));

  const { error } = await supabase
    .from('attendance')
    .upsert(records, { onConflict: ['user_id', 'date'] });

  if (error) throw error;
};

const removeLeaveAttendance = async (userId, fromDate, toDate) => {
  const dates = getLeaveDates(fromDate, toDate);
  if (!dates.length) return;

  const { error } = await supabase
    .from('attendance')
    .delete()
    .in('date', dates)
    .eq('user_id', userId)
    .eq('status', 'leave');

  if (error) throw error;
};

router.post('/', protect, async (req, res) => {
  const { employee_name, leave_type, from_date, to_date, reason, description } = req.body;
  try {
    let emp_id = null;
    let empData;
    let leaveBalance = 0;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('emp_id, leave_balance')
        .eq('user_id', req.user.id)
        .single();

      if (error) throw error;
      empData = data;
      leaveBalance = Number(empData?.leave_balance ?? 0);
    } catch (err) {
      if (isMissingColumnError(err, 'leave_balance')) {
        const { data, error } = await supabase
          .from('employees')
          .select('emp_id')
          .eq('user_id', req.user.id)
          .single();
        if (error) throw error;
        empData = data;
        leaveBalance = 0;
      } else {
        throw err;
      }
    }

    emp_id = empData?.emp_id || null;

    const total_days = countWorkingDays(from_date, to_date);
    if (total_days <= 0) {
      return res.status(400).json({ message: 'Please select a valid date range.' });
    }

    if (total_days > leaveBalance) {
      return res.status(400).json({ message: `Insufficient leave balance (need ${total_days}, available ${leaveBalance}).` });
    }

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
    // Fetch existing request to determine current status, requested days, and dates
    const { data: existingReq, error: fetchErr } = await supabase
      .from('leave_requests')
      .select('id, user_id, emp_id, total_days, from_date, to_date, status')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existingReq) return res.status(404).json({ message: 'Leave request not found' });

    // On approve, deduct leave balance (only once when transitioning from pending)
    if (status === 'approved' && existingReq.status !== 'approved') {
        let currentBalance = 0;

        try {
          const { data: empData, error: empErr } = await supabase
            .from('employees')
            .select('leave_balance')
            .eq('emp_id', existingReq.emp_id)
            .maybeSingle();

          if (empErr) throw empErr;
          currentBalance = Number(empData?.leave_balance ?? 0);
        } catch (err) {
          if (!isMissingColumnError(err, 'leave_balance')) {
            throw err;
          }
        }

        const needed = Number(existingReq.total_days || 0);

        if (needed > currentBalance) {
          return res.status(400).json({ message: 'Insufficient leave balance to approve this request.' });
        }

        if (currentBalance > 0) {
          const newBalance = currentBalance - needed;
          const { error: updateErr } = await supabase
            .from('employees')
            .update({ leave_balance: newBalance })
            .eq('emp_id', existingReq.emp_id);

          if (updateErr) throw updateErr;
        }
      }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Reflect approved leave in attendance calendar (weekdays only)
    if (status === 'approved') {
      try {
        await upsertLeaveAttendance(existingReq.user_id, existingReq.emp_id, existingReq.from_date, existingReq.to_date);
      } catch (err) {
        console.error('Failed to upsert leave attendance', err);
      }
    }

    // If the request is rejected after being approved, remove the leave entries
    if (status === 'rejected' && existingReq.status === 'approved') {
      try {
        await removeLeaveAttendance(existingReq.user_id, existingReq.from_date, existingReq.to_date);
      } catch (err) {
        console.error('Failed to remove leave attendance', err);
      }
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update leave request' });
  }
});

export default router;