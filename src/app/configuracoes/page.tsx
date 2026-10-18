'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    localStorage.setItem('userName', name.trim());
    
    setTimeout(() => {
      setIsSaving(false);
      router.push('/');
    }, 500);
  };

  const handleReset = () => {
    setIsResetting(true);
    
    // Clear all localStorage data
    localStorage.clear();
    
    setTimeout(() => {
      setIsResetting(false);
      setShowResetConfirm(false);
      window.location.href = '/';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Configurações
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seu nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                />
              </div>
              
              <Button
                onClick={handleSave}
                disabled={!name.trim() || isSaving}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Esta ação apagará todos os seus dados incluindo atendimentos, serviços e configurações.
                </AlertDescription>
              </Alert>
              
              {!showResetConfirm ? (
                <Button
                  onClick={() => setShowResetConfirm(true)}
                  variant="destructive"
                  className="w-full"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Resetar Sistema
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowResetConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="destructive"
                      className="flex-1"
                      disabled={isResetting}
                    >
                      {isResetting ? 'Resetando...' : 'Confirmar'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
