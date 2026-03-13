import { useContext } from 'react';
import { EmployeeContext } from './EmployeeContext';

// ✅ Separated from EmployeeContext.jsx to fix Fast Refresh ESLint error
const useEmployees = () => useContext(EmployeeContext);

export default useEmployees;