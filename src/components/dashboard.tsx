'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Menu, Scissors, Calendar, TrendingUp, DollarSign, AlertCircle, List, Clock, Target, Settings } from 'lucide-react';
import ThemeToggle from './theme-toggle';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate, formatTime, getCurrentFortnight, getWeekDates, getMonthDates } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NewAppointmentDialog from './new-appointment-dialog';
import { appointmentsApi, servicesApi, fortnightClosureApi } from '@/lib/api-client';

interface DashboardStats {
  today: {
    appointments: number;
    totalServices: number;
    totalCommission: number;
    averageTicket: number;
  };
  period: {
    week: { totalServices: number; totalCommission: number };
    fortnight: { totalServices: number; totalCommission: number; received: number; difference: number };
    month: { totalServices: number; totalCommission: number };
  };
}

interface DashboardProps {
  userName?: string;
  onLogout?: () => void;
}

export default function Dashboard({ userName = 'Profissional', onLogout }: DashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    today: { appointments: 0, totalServices: 0, totalCommission: 0, averageTicket: 0 },
    period: {
      week: { totalServices: 0, totalCommission: 0 },
      fortnight: { totalServices: 0, totalCommission: 0, received: 0, difference: 0 },
      month: { totalServices: 0, totalCommission: 0 }
    }
  });
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
    generateAlerts();
  }, []);

  const loadStats = async () => {
    try {
      const appointments = await appointmentsApi.getAll();
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Today's stats
      const todayAppointments = appointments.filter(apt => 
        apt.appointment_date.startsWith(todayStr)
      );
      
      const todayStats = {
        appointments: todayAppointments.length,
        totalServices: todayAppointments.reduce((sum, apt) => sum + apt.service_price, 0),
        totalCommission: todayAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0),
        averageTicket: todayAppointments.length > 0 
          ? todayAppointments.reduce((sum, apt) => sum + apt.service_price, 0) / todayAppointments.length 
          : 0
      };

      // Week stats
      const { start: weekStart, end: weekEnd } = getWeekDates();
      const weekAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= weekStart && aptDate <= weekEnd;
      });
      
      const weekStats = {
        totalServices: weekAppointments.reduce((sum, apt) => sum + apt.service_price, 0),
        totalCommission: weekAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0)
      };

      // Fortnight stats
      const { year, month, fortnightNumber } = getCurrentFortnight();
      const { start: fortnightStart, end: fortnightEnd } = getMonthDates(year, month);
      const adjustedStart = fortnightNumber === 1
        ? fortnightStart
        : new Date(year, month - 1, 16);
      const adjustedEnd = fortnightNumber === 1
        ? new Date(year, month - 1, 15)
        : fortnightEnd;

      const fortnightAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= adjustedStart && aptDate <= adjustedEnd;
      });

      // Get fortnight closure data
      const fortnightClosure = await fortnightClosureApi.getByPeriod(year, month, fortnightNumber);

      const fortnightStats = {
        totalServices: fortnightAppointments.reduce((sum, apt) => sum + apt.service_price, 0),
        totalCommission: fortnightAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0),
        received: fortnightClosure?.amount_received || 0,
        difference: fortnightClosure?.difference || 0
      };

      // Month stats
      const { start: monthStart, end: monthEnd } = getMonthDates(year, month);
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      });
      
      const monthStats = {
        totalServices: monthAppointments.reduce((sum, apt) => sum + apt.service_price, 0),
        totalCommission: monthAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0)
      };

      setStats({
        today: todayStats,
        period: {
          week: weekStats,
          fortnight: fortnightStats,
          month: monthStats
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateAlerts = () => {
    const newAlerts: string[] = [];
    
    if (stats.today.appointments === 0) {
      newAlerts.push('Você ainda não registrou nenhum atendimento hoje.');
    } else if (stats.today.appointments >= 8) {
      newAlerts.push(`Você realizou ${stats.today.appointments} atendimentos hoje!`);
    }
    
    if (stats.today.totalCommission > 0) {
      newAlerts.push(`Sua comissão hoje já está em ${formatCurrency(stats.today.totalCommission)}.`);
    }
    
    setAlerts(newAlerts);
  };

  const handleAppointmentCreated = () => {
    setShowNewAppointment(false);
    loadStats();
    generateAlerts();
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Olá, {getFirstName(userName)}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(new Date())}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              <Button
                onClick={() => setShowNewAppointment(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Atendimento
              </Button>
              
              <Sheet>
                <SheetTrigger render={
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                } />
                <SheetContent>
                  <nav className="space-y-4 mt-8">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/')}>
                      <Scissors className="w-5 h-5 mr-2" />
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/servicos')}>
                      <List className="w-5 h-5 mr-2" />
                      Serviços
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/historico')}>
                      <Calendar className="w-5 h-5 mr-2" />
                      Histórico
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/fechamento-dia')}>
                      <Clock className="w-5 h-5 mr-2" />
                      Fechar Dia
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/quinzena')}>
                      <Calendar className="w-5 h-5 mr-2" />
                      Quinzena
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/relatorios')}>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Relatórios
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/projecao')}>
                      <Target className="w-5 h-5 mr-2" />
                      Projeção e Metas
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/configuracoes')}>
                      <Settings className="w-5 h-5 mr-2" />
                      Configurações
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={onLogout}>
                      Sair
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {alerts.map((alert, index) => (
            <Alert key={index} className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alert}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Hoje</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Atendimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.today.appointments}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valor dos Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.today.totalServices)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Minha Comissão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.today.totalCommission)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.today.averageTicket)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Period Stats */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Período Atual</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Week */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Esta Semana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Faturamento em serviços</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.period.week.totalServices)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minha comissão</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.period.week.totalCommission)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fortnight */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg">Quinzena Atual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Faturamento em serviços</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.period.fortnight.totalServices)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minha comissão</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.period.fortnight.totalCommission)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Já recebido</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(stats.period.fortnight.received)}
                  </p>
                </div>
                {stats.period.fortnight.difference !== 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Diferença</p>
                    <p className={`text-xl font-bold ${stats.period.fortnight.difference > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {formatCurrency(Math.abs(stats.period.fortnight.difference))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Month */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Este Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Faturamento em serviços</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stats.period.month.totalServices)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Minha comissão</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.period.month.totalCommission)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* New Appointment Dialog */}
      {showNewAppointment && (
        <NewAppointmentDialog
          open={showNewAppointment}
          onOpenChange={setShowNewAppointment}
          onAppointmentCreated={handleAppointmentCreated}
        />
      )}
    </div>
  );
}