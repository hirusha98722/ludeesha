import React, { ReactNode, useContext } from 'react';
// import SplashScreen from '../../components/SplashScreen';
import { AuthContext } from './auth-context';

// Define the props interface
interface AuthConsumerProps {
  children: ReactNode;
}

export function AuthConsumer({ children }: AuthConsumerProps) {
  const auth = useContext(AuthContext);

  return auth?.loading ? "Loading..." : <>{children}</>;
}
