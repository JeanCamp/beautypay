'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatDate, getCurrentFortnight, getFortnightDates, getMonthDates } from '@/lib/utils';
import { appointmentsApi, fortnightClosureApi, servicesApi, Appointment, Service } from '@/lib/api-client';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, TrendingUp, Download } from 'lucide-react';
import ExportDialog from './export-dialog';
import { ExportData } from '@/lib/export';

export default function FortnightClosure() {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [fortnightData, setFortnightData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    loadFortnightData();
  }, [selectedPeriod]);

  const loadFortnightData = async () => {
    let year, month, fortnightNumber;
    
    if (selectedPeriod === 'current') {
      const current = getCurrentFortnight();
      year = current.year;
      month = current.month;
      fortnightNumber = current.fortnightNumber;
    } else {
      // Parse custom period (format: YYYY-M-F)
      const [y, m, f] = selectedPeriod.split('-').map(Number);
      year = y;
      month = m;
      fortnightNumber = f as 1 | 2;
    }

    const { start, end } = getFortnightDates(year, month, fortnightNumber);
    
    // Load appointments for the period
    const allAppointments = await appointmentsApi.getAll();
    const allServices = await servicesApi.getAll();
    const periodAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= start && aptDate <= end;
    });
    
    setAppointments(periodAppointments);
    setServices(allServices);
    
    // Calculate totals
    const totalServicesValue = periodAppointments.reduce((sum, apt) => sum + apt.service_price, 0);
    const totalCommission = periodAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0);
    
    // Get existing closure
    const closure = await fortnightClosureApi.getByPeriod(year, month, fortnightNumber);
    
    setFortnightData({
      year,
      month,
      fortnightNumber,
      startDate: start,
      endDate: end,
      totalAppointments: periodAppointments.length,
      totalServicesValue,
      totalCommission,
      amountReceived: closure?.amount_received || 0,
      difference: closure?.difference || 0,
      notes: closure?.notes || '',
      isClosed: closure?.is_closed || false
    });
  };

  const getPeriodLabel = () => {
    if (!fortnightData) return '';
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    return `${fortnightData.fortnightNumber}ª Quinzena — ${monthNames[fortnightData.month - 1]} ${fortnightData.year}`;
  };

  const handleRecordPayment = () => {
    setShowPaymentDialog(true);
    if (fortnightData) {
      setPaymentAmount(fortnightData.amountReceived.toString());
      setPaymentNotes(fortnightData.notes || '');
    }
  };

  const confirmPayment = async () => {
    setIsRecording(true);
    
    try {
      if (!fortnightData) return;
      
      const amount = parseFloat(paymentAmount);
      const difference = fortnightData.totalCommission - amount;
      
      await fortnightClosureApi.update(
        fortnightData.year,
        fortnightData.month,
        fortnightData.fortnightNumber,
        {
          amount_received: amount,
          difference,
          notes: paymentNotes || undefined
        }
      );
      
      loadFortnightData();
      setShowPaymentDialog(false);
    } catch (error) {
      console.error('Error recording payment:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleCloseFortnight = async () => {
    if (!fortnightData) return;

    try {
      const now = new Date();
      const closedAt = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

      await fortnightClosureApi.update(
        fortnightData.year,
        fortnightData.month,
        fortnightData.fortnightNumber,
        {
          is_closed: true,
          closed_at: closedAt
        }
      );

      loadFortnightData();
    } catch (error) {
      console.error('Error closing fortnight:', error);
    }
  };

  const handleReopenFortnight = async () => {
    if (!fortnightData) return;

    try {
      const now = new Date();
      const reopenedAt = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

      await fortnightClosureApi.update(
        fortnightData.year,
        fortnightData.month,
        fortnightData.fortnightNumber,
        {
          is_closed: false,
          reopened_at: reopenedAt
        }
      );

      loadFortnightData();
    } catch (error) {
      console.error('Error reopening fortnight:', error);
    }
  };

  const generatePeriodOptions = () => {
    const options = [];
    const current = getCurrentFortnight();
    
    // Add current period
    options.push({
      value: 'current',
      label: 'Quinzena Atual'
    });
    
    // Add previous periods (last 3 months)
    for (let i = 1; i <= 6; i++) {
      const date = new Date(current.year, current.month - 1 - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      options.push({ value: `${year}-${month}-1`, label: `${month}/${year} - 1ª Quinzena` });
      options.push({ value: `${year}-${month}-2`, label: `${month}/${year} - 2ª Quinzena` });
    }
    
    return options;
  };

  if (!fortnightData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const hasDifference = Math.abs(fortnightData.difference) > 0.01;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fechamento de Quinzena</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getPeriodLabel()}
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={(value) => value && setSelectedPeriod(value)}>
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Selecione o período">
              {selectedPeriod === 'current' ? 'Quinzena Atual' :
               generatePeriodOptions().find(opt => opt.value === selectedPeriod)?.label || 'Selecione o período'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {generatePeriodOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {fortnightData.totalAppointments}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Serviços Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(fortnightData.totalServicesValue)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Comissão Calculada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(fortnightData.totalCommission)}
            </div>
          </CardContent>
        </Card>
        
        <Card className={hasDifference ? 'border-orange-200 dark:border-orange-800' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pagamento Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(fortnightData.amountReceived)}
            </div>
          </CardContent>
        </Card>
      </div>

      {fortnightData.isClosed && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Quinzena fechada em {fortnightData.closed_at ? new Date(fortnightData.closed_at).toLocaleString('pt-BR') : 'data desconhecida'}
          </AlertDescription>
        </Alert>
      )}

      {hasDifference && (
        <Alert variant={fortnightData.difference > 0 ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Diferença:</strong> {formatCurrency(Math.abs(fortnightData.difference))}
            {fortnightData.difference > 0 ? ' a receber' : ' a mais'}
            {fortnightData.notes && (
              <span className="block mt-1 text-sm">
                <strong>Observação:</strong> {fortnightData.notes}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {!hasDifference && fortnightData.amountReceived > 0 && !fortnightData.isClosed && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Pagamento conferido! Não há diferença entre o valor calculado e o recebido.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Quinzena</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Período:</p>
              <p className="font-medium">{formatDate(fortnightData.startDate)} - {formatDate(fortnightData.endDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Status:</p>
              <p className="font-medium">
                {fortnightData.isClosed ? (
                  <span className="text-green-600">Fechado</span>
                ) : (
                  <span className="text-yellow-600">Em andamento</span>
                )}
              </p>
            </div>
          </div>

          {appointments.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Últimos atendimentos</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>{formatDate(apt.appointment_date)}</span>
                    <span className="font-medium">{formatCurrency(apt.commission_amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={handleRecordPayment}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Registrar Pagamento
        </Button>
        
        {!fortnightData.isClosed ? (
          <Button
            onClick={handleCloseFortnight}
            variant="outline"
            className="gap-2"
          >
            <Calendar className="w-5 h-5" />
            Fechar Quinzena
          </Button>
        ) : (
          <Button
            onClick={handleReopenFortnight}
            variant="outline"
            className="gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Reabrir
          </Button>
        )}
        
        <Button
          onClick={() => setShowExportDialog(true)}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-5 h-5" />
          Gerar Relatório
        </Button>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento Recebido</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Comissão calculada:</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(fortnightData.totalCommission)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Valor Recebido (R$)</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                placeholder="Digite o valor recebido"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNotes">Observações (opcional)</Label>
              <Input
                id="paymentNotes"
                type="text"
                placeholder="Ex: O restante será pago no próximo mês"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>

            {paymentAmount && (
              <div className={`p-4 rounded-lg ${
                Math.abs(fortnightData.totalCommission - parseFloat(paymentAmount)) < 0.01
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-orange-50 dark:bg-orange-900/20'
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Diferença:</p>
                <p className={`text-xl font-bold ${
                  Math.abs(fortnightData.totalCommission - parseFloat(paymentAmount)) < 0.01
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}>
                  {formatCurrency(Math.abs(fortnightData.totalCommission - parseFloat(paymentAmount)))}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={isRecording}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmPayment}
              disabled={!paymentAmount || isRecording}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isRecording ? 'Registrando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      {showExportDialog && fortnightData && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          data={{
            appointments,
            services,
            summary: {
              totalAppointments: fortnightData.totalAppointments,
              totalServicesValue: fortnightData.totalServicesValue,
              totalCommission: fortnightData.totalCommission
            }
          }}
          title="Gerar Relatório da Quinzena"
          fortnightInfo={{
            start: formatDate(fortnightData.startDate),
            end: formatDate(fortnightData.endDate),
            number: fortnightData.fortnightNumber,
            month: fortnightData.month,
            year: fortnightData.year
          }}
        />
      )}
    </div>
  );
}