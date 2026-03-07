import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/employees');
      setEmployees(data || []);
    } catch (err) {
      console.error('Failed to fetch employees', err);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const value = {
    employees,
    loading,
    error,
    refreshEmployees: fetchEmployees,
    setEmployees,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => useContext(EmployeeContext);

