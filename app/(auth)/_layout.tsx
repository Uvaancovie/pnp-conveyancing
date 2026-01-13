import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import SplashScreen from '../../components/splash-screen';
import { useAuth } from '../../contexts/auth-context';

const MIN_SPLASH_MS = 650;

export default function AuthLayout() {
  const { loading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  if (loading || !minTimeElapsed) {
    return <SplashScreen />;
  }

  return <Slot />;
}
