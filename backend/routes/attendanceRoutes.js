import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const formatISODate = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getWorkingDates = (fromDate, toDate) => {
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
    const fromISO = fromDate.toISOString().slice(0, 10);
    const toISO = toDate.toISOString().slice(0, 10);

    // Fetch any existing attendance records
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('user_id', req.user.id)
      .gte('date', fromISO)
      .lte('date', toISO)
      .order('date', { ascending: true });

    if (attendanceError) throw attendanceError;

    const map = {};
    (attendanceData || []).forEach((row) => {
      if (row.date && row.status) {
        map[row.date] = row.status;
      }
    });

    // If there are approved leave requests in this period, mark those days as leave as well.
    const { data: leaveData, error: leaveError } = await supabase
      .from('leave_requests')
      .select('from_date, to_date')
      .eq('user_id', req.user.id)
      .eq('status', 'approved')
      .lte('from_date', toISO)
      .gte('to_date', fromISO);

    if (leaveError) throw leaveError;

    (leaveData || []).forEach((leave) => {
      const dates = getWorkingDates(leave.from_date, leave.to_date);
      dates.forEach((d) => {
        // Only highlight days in the currently viewed month
        if (d >= fromISO && d <= toISO) {
          map[d] = 'leave';
        }
      });
    });

    // Convert map to array for legacy response shape
    const response = Object.entries(map).map(([date, status]) => ({ date, status }));

    res.json(response);
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

    if (!['present', 'absent', 'late', 'leave'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use present, absent, late, or leave.' });
    }

    if (!user_id && !emp_id) {
      return res.status(400).json({ message: 'user_id or emp_id is required.' });
    }

    // If only emp_id is provided, look up user_id from employees table.
    // If we can't resolve a user_id, we still allow marking attendance by emp_id alone.
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

    // Upsert logic: check if a record already exists for this user/date or emp_id/date
    const query = supabase.from('attendance').select('id').eq('date', date);
    if (resolvedUserId) query.eq('user_id', resolvedUserId);
    else query.eq('emp_id', resolvedEmpId);

    const { data: existing, error: fetchError } = await query.maybeSingle();

    if (fetchError) throw fetchError;

    let result;

    const updatePayload = {
      status,
      emp_id: resolvedEmpId,
      updated_at: new Date().toISOString(),
    };
    if (resolvedUserId) updatePayload.user_id = resolvedUserId;

    const insertPayload = {
      emp_id: resolvedEmpId,
      date,
      status,
    };
    if (resolvedUserId) insertPayload.user_id = resolvedUserId;

    if (existing) {
      const { data, error } = await supabase
        .from('attendance')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('attendance')
        .insert([insertPayload])
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

