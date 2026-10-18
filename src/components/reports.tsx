'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate, getWeekDates, getMonthDates } from '@/lib/utils';
import { appointmentsApi, servicesApi, Appointment, Service } from '@/lib/api-client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Award, Target } from 'lucide-react';

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];

export default function Reports() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [period, setPeriod] = useState('month');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      const allAppointments = await appointmentsApi.getAll();
      const allServices = await servicesApi.getAll();
      
      setAppointments(allAppointments);
      setServices(allServices);
      
      const data = generateReportData(allAppointments, allServices, period);
      setReportData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateReportData = (appointments: Appointment[], services: Service[], period: string) => {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;
    
    switch (period) {
      case 'week':
        const weekDates = getWeekDates(now);
        startDate = weekDates.start;
        groupBy = 'day';
        break;
      case 'month':
        const monthDates = getMonthDates(now.getFullYear(), now.getMonth() + 1);
        startDate = monthDates.start;
        groupBy = 'day';
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        groupBy = 'week';
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
    }

    const filteredAppointments = appointments.filter(apt => 
      new Date(apt.appointment_date) >= startDate
    );

    // Group by date
    const groupedByDate = filteredAppointments.reduce((acc, apt) => {
      const date = apt.appointment_date.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalServices: 0,
          totalCommission: 0,
          count: 0
        };
      }
      acc[date].totalServices += apt.service_price;
      acc[date].totalCommission += apt.commission_amount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    const dailyData = Object.values(groupedByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Service frequency
    const serviceFrequency = services.map(service => {
      const serviceAppointments = filteredAppointments.filter(apt => apt.service_id === service.id);
      return {
        name: service.name,
        count: serviceAppointments.length,
        totalCommission: serviceAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0)
      };
    }).filter(s => s.count > 0).sort((a, b) => b.count - a.count).slice(0, 10);

    // Summary stats
    const totalServicesValue = filteredAppointments.reduce((sum, apt) => sum + apt.service_price, 0);
    const totalCommission = filteredAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0);
    const averageDaily = filteredAppointments.length > 0 
      ? totalCommission / Math.max(1, dailyData.length) 
      : 0;
    
    const bestDay = dailyData.length > 0 
      ? dailyData.reduce((best, current) => 
          current.totalCommission > best.totalCommission ? current : best
        )
      : null;

    return {
      dailyData,
      serviceFrequency,
      summary: {
        totalAppointments: filteredAppointments.length,
        totalServicesValue,
        totalCommission,
        averageDaily,
        bestDay: bestDay ? {
          date: bestDay.date,
          amount: bestDay.totalCommission
        } : null
      }
    };
  };

  if (!reportData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Análise detalhada do seu desempenho
          </p>
        </div>
        
        <Select value={period} onValueChange={(value) => value && setPeriod(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mês</SelectItem>
            <SelectItem value="quarter">Último Trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {reportData.summary.totalAppointments}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(reportData.summary.totalServicesValue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Comissão Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(reportData.summary.totalCommission)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Média Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(reportData.summary.averageDaily)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Day */}
      {reportData.summary.bestDay && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Melhor dia do período</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDate(reportData.summary.bestDay.date)} - {formatCurrency(reportData.summary.bestDay.amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="commission" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="commission">Comissão por Dia</TabsTrigger>
          <TabsTrigger value="services">Serviços Mais Realizados</TabsTrigger>
        </TabsList>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comissão por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.dailyData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis tickFormatter={(value) => `R$${value}`} />
                      <Tooltip
                        formatter={(value: any) => value !== undefined && typeof value === 'number' ? [formatCurrency(value), 'Comissão'] : ['', '']}
                        labelFormatter={(value: any) => value !== undefined ? new Date(value).toLocaleDateString('pt-BR') : ''}
                      />
                      <Bar dataKey="totalCommission" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.serviceFrequency.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.serviceFrequency} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: any) => value !== undefined && typeof value === 'number' ? [value, 'Vezes'] : ['', '']} />
                      <Bar dataKey="count" fill="#EC4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comissão por Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.serviceFrequency.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.serviceFrequency}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name} (${Math.round((entry.totalCommission / reportData.summary.totalCommission) * 100)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalCommission"
                      >
                        {reportData.serviceFrequency.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => value !== undefined && typeof value === 'number' ? [formatCurrency(value), 'Comissão'] : ['', '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}