import { useContext } from 'react';
import { AuthContext } from './AuthContext';

// ✅ Moved to its own file so AuthContext.jsx only exports components
// ✅ This fixes the "Fast Refresh broken" ESLint error
const useAuth = () => useContext(AuthContext);

export default useAuth;