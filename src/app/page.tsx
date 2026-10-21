'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex">
      {/* Banner - Esquerda */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-8">
        <img
          src="/beautypay-banner.png"
          alt="BeautyPay"
          className="max-w-full max-h-[90vh] object-contain"
        />
      </div>

      {/* Formulário - Direita */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              BeautyPay
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de controle de comissões para profissionais de beleza
            </p>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
            >
              Entrar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              variant="outline"
              className="w-full text-lg py-6"
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}