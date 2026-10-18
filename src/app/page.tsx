'use client';

import { useEffect, useState } from 'react';
import Dashboard from '@/components/dashboard';
import SetupName from '@/components/setup-name';

export default function Home() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkSetup = () => {
      const setupComplete = localStorage.getItem('setupComplete');
      const name = localStorage.getItem('userName');
      
      if (setupComplete && name) {
        setIsSetupComplete(true);
        setUserName(name);
      }
      
      setIsLoading(false);
    };

    checkSetup();
  }, []);

  const handleSetupComplete = (name: string) => {
    setUserName(name);
    setIsSetupComplete(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isSetupComplete) {
    return <SetupName onComplete={handleSetupComplete} />;
  }

  return <Dashboard userName={userName} />;
}