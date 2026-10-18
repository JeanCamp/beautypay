'use client';

import { useRouter } from 'next/navigation';
import ServicesCatalog from '@/components/services-catalog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ServicesPage() {
  const router = useRouter();

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
              Catálogo de Serviços
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ServicesCatalog />
      </main>
    </div>
  );
}