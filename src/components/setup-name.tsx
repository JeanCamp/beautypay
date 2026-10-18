'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scissors } from 'lucide-react';
import { initializeServices } from '@/lib/seed';

interface SetupNameProps {
  onComplete: (name: string) => void;
}

export default function SetupName({ onComplete }: SetupNameProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    
    // Initialize pre-configured services
    await initializeServices();
    
    // Save name to localStorage
    localStorage.setItem('userName', name.trim());
    localStorage.setItem('setupComplete', 'true');
    
    setTimeout(() => {
      onComplete(name.trim());
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao BeautyPay!</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Como você gostaria de ser chamado?
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'Configurando...' : 'Começar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
