import { supabase } from '../config/supabase.js';

export const getActivityLogs = async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
