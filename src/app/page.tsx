'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Scissors } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section com Banner */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
          <img
            src="/beautypay-banner.png"
            alt="BeautyPay Banner"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-pink-900/80 dark:from-gray-900/90 dark:to-purple-900/90" />
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm p-4 rounded-full mb-6">
              <Scissors className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
              BeautyPay
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-4">
              Controle suas comissões de forma simples e eficiente
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Sistema completo para profissionais de beleza acompanhar atendimentos, calcular comissões e gerenciar pagamentos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => router.push('/login')}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 min-w-[200px]"
            >
              Entrar
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              onClick={() => router.push('/register')}
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 min-w-[200px]"
            >
              Criar Conta
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white/90">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">Simples</h3>
              <p className="text-sm">Interface intuitiva e fácil de usar</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">Rápido</h3>
              <p className="text-sm">Registre atendimentos em segundos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">Seguro</h3>
              <p className="text-sm">Seus dados protegidos na nuvem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}