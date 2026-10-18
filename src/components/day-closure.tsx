'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatDate } from '@/lib/utils';
import { appointmentsApi, dayClosureApi, Appointment } from '@/lib/api-client';
import { Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DayClosure() {
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [dayClosure, setDayClosure] = useState<any>(null);
  const [showClosureDialog, setShowClosureDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  useEffect(() => {
    loadDayData();
  }, [selectedDate]);

  const loadDayData = async () => {
    // Load appointments for selected date
    const allAppointments = await appointmentsApi.getAll();
    const dayAppointments = allAppointments.filter(apt => {
      const aptDate = apt.appointment_date.split('T')[0];
      return aptDate === selectedDate;
    });
    setTodayAppointments(dayAppointments);

    // Check if day is already closed
    const closure = await dayClosureApi.getByDate(selectedDate);
    setDayClosure(closure);
  };

  const calculateDaySummary = () => {
    const totalAppointments = todayAppointments.length;
    const totalServicesValue = todayAppointments.reduce((sum, apt) => sum + apt.service_price, 0);
    const totalCommission = todayAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0);
    
    return {
      totalAppointments,
      totalServicesValue,
      totalCommission
    };
  };

  const handleCloseDay = () => {
    setShowClosureDialog(true);
  };

  const confirmCloseDay = async () => {
    setIsClosing(true);

    try {
      const summary = calculateDaySummary();

      // Check if closure already exists
      const existingClosure = await dayClosureApi.getByDate(selectedDate);

      if (existingClosure) {
        // Update existing closure
        await dayClosureApi.update(selectedDate, {
          total_appointments: summary.totalAppointments,
          total_services_value: summary.totalServicesValue,
          total_commission: summary.totalCommission,
          is_closed: true,
          closed_at: new Date().toISOString(),
          reopened_at: undefined
        });
      } else {
        // Create new closure
        await dayClosureApi.create({
          closure_date: selectedDate,
          total_appointments: summary.totalAppointments,
          total_services_value: summary.totalServicesValue,
          total_commission: summary.totalCommission,
          is_closed: true,
          closed_at: new Date().toISOString(),
          reopened_at: undefined
        });
      }

      setShowSuccess(true);
      loadDayData();

      setTimeout(() => {
        setShowSuccess(false);
        setShowClosureDialog(false);
      }, 2000);
    } catch (error) {
      console.error('Error closing day:', error);
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenDay = async () => {
    if (!confirm('Tem certeza que deseja reabrir este dia? Você poderá fazer alterações nos atendimentos.')) {
      return;
    }

    setIsReopening(true);

    try {
      await dayClosureApi.update(selectedDate, {
        is_closed: false,
        reopened_at: new Date().toISOString()
      });

      loadDayData();
    } catch (error) {
      console.error('Error reopening day:', error);
    } finally {
      setIsReopening(false);
    }
  };

  const summary = calculateDaySummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fechamento do Dia</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecione a data para fechar ou reabrir
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          {dayClosure?.is_closed ? (
            <Button
              variant="outline"
              onClick={handleReopenDay}
              disabled={isReopening}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isReopening ? 'animate-spin' : ''}`} />
              {isReopening ? 'Reabrindo...' : 'Reabrir'}
            </Button>
          ) : (
            <Button
              onClick={handleCloseDay}
              disabled={todayAppointments.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Fechar Dia
            </Button>
          )}
        </div>
      </div>

      {dayClosure?.is_closed && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Dia {formatDate(dayClosure.closure_date)} fechado às {new Date(dayClosure.closed_at).toLocaleTimeString('pt-BR')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.totalAppointments}
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
              {formatCurrency(summary.totalServicesValue)}
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
              {formatCurrency(summary.totalCommission)}
            </div>
          </CardContent>
        </Card>
      </div>

      {todayAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.client_name || 'Cliente não informado'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(appointment.appointment_date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(appointment.service_price)}
                    </p>
                    <p className="text-sm text-green-600">
                      {formatCurrency(appointment.commission_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {todayAppointments.length === 0 && !dayClosure?.is_closed && (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Nenhum atendimento registrado hoje
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Registre atendimentos para fechar o dia
            </p>
          </CardContent>
        </Card>
      )}

      {/* Closure Confirmation Dialog */}
      <Dialog open={showClosureDialog} onOpenChange={setShowClosureDialog}>
        <DialogContent>
          {showSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <DialogTitle className="text-2xl font-bold mb-2">
                Dia Fechado com Sucesso!
              </DialogTitle>
              <p className="text-gray-600 dark:text-gray-300">
                O resumo do dia foi salvo
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Fechamento do Dia</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Após fechar o dia, você não poderá adicionar novos atendimentos para esta data
                    sem reabrir o fechamento.
                  </AlertDescription>
                </Alert>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Atendimentos:</span>
                    <span className="font-bold">{summary.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Valor dos serviços:</span>
                    <span className="font-bold">{formatCurrency(summary.totalServicesValue)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600 dark:text-gray-400">Minha comissão:</span>
                    <span className="font-bold text-green-600">{formatCurrency(summary.totalCommission)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowClosureDialog(false)}
                  disabled={isClosing}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmCloseDay}
                  disabled={isClosing}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isClosing ? 'Fechando...' : 'Confirmar Fechamento'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}