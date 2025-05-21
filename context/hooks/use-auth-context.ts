import { useContext } from 'react';
import { AuthContext } from '../auth/auth-context';

// Create the type for what the context should return
import { AuthContextType } from '../auth/auth-context';  // Assuming you defined AuthContextType in 'auth-context'

// ----------------------------------------------------------------------

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
