'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, calculateCommission, formatDateTime } from '@/lib/utils';
import { servicesApi, appointmentsApi, dayClosureApi, fortnightClosureApi, Service } from '@/lib/api-client';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentCreated: () => void;
}

export default function NewAppointmentDialog({ open, onOpenChange, onAppointmentCreated }: NewAppointmentDialogProps) {
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [clientName, setClientName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(getLocalDate());
  const [closureWarning, setClosureWarning] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadServices();
      checkClosureStatus();
    }
  }, [open, appointmentDate]);

  const checkClosureStatus = async () => {
    try {
      const dayClosure = await dayClosureApi.getByDate(appointmentDate);
      if (dayClosure?.is_closed) {
        setClosureWarning('Este dia já foi fechado. Reabra o dia para adicionar atendimentos.');
        return;
      }

      // Check fortnight closure
      const d = new Date(appointmentDate);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const fortnightNumber = day <= 15 ? 1 : 2;

      const fortnightClosure = await fortnightClosureApi.getByPeriod(year, month, fortnightNumber);
      if (fortnightClosure?.is_closed) {
        setClosureWarning('Esta quinzena já foi fechada. Reabra a quinzena para adicionar atendimentos.');
        return;
      }

      setClosureWarning(null);
    } catch (error) {
      console.error('Error checking closure status:', error);
    }
  };

  const loadServices = async () => {
    try {
      const allServices = await servicesApi.getAll();
      setServices(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleServiceChange = (serviceId: string | null) => {
    if (!serviceId) return;
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setSelectedService(service);
      setServicePrice(service.price.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      return;
    }

    setIsSubmitting(true);

    try {
      const price = parseFloat(servicePrice);
      const commissionAmount = calculateCommission(price, selectedService.commission_percentage);
      
      const appointment = await appointmentsApi.create({
        client_name: clientName || undefined,
        service_id: selectedService.id,
        service_price: price,
        commission_percentage: selectedService.commission_percentage,
        commission_amount: commissionAmount,
        payment_method: paymentMethod || undefined,
        appointment_date: new Date(appointmentDate + 'T12:00:00').toISOString(),
        notes: notes || undefined
      });

      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setSelectedService(null);
        setClientName('');
        setServicePrice('');
        setPaymentMethod('');
        setNotes('');
        setShowSuccess(false);
        onOpenChange(false);
        onAppointmentCreated();
      }, 2000);
      
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (value: string) => {
    // Allow only numbers and decimal separator
    const cleaned = value.replace(/[^\d.,]/g, '');
    setServicePrice(cleaned);
  };

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              Atendimento Registrado!
            </DialogTitle>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Comissão atualizada automaticamente
            </p>
            {selectedService && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Comissão deste atendimento:</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateCommission(parseFloat(servicePrice) || selectedService.price, selectedService.commission_percentage))}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Novo Atendimento</DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Data: {new Date(appointmentDate).toLocaleDateString('pt-BR')}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {closureWarning && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    {closureWarning}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Mude a data para adicionar atendimentos em outro dia/quinzena.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="appointmentDate">Data do Atendimento *</Label>
            <Input
              id="appointmentDate"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Serviço *</Label>
            <Select onValueChange={handleServiceChange} required>
              <SelectTrigger id="service">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent className="max-h-[600px]">
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    <div className="flex flex-col items-start py-3 px-6 min-w-0">
                      <span className="font-medium text-sm leading-relaxed break-words">{service.name}</span>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatCurrency(service.price)} · {service.commission_percentage}%
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <>
              <div className="space-y-2">
                <Label htmlFor="clientName">Cliente (opcional)</Label>
                <Input
                  id="clientName"
                  type="text"
                  placeholder="Nome do cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servicePrice">Valor Cobrado *</Label>
                <Input
                  id="servicePrice"
                  type="text"
                  placeholder={formatCurrency(selectedService.price)}
                  value={servicePrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Preço padrão: {formatCurrency(selectedService.price)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Forma de Pagamento (opcional)</Label>
                <Select onValueChange={(value: string | null) => { if (value) setPaymentMethod(value); }}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="debito">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Input
                  id="notes"
                  type="text"
                  placeholder="Alguma observação?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Commission Preview */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comissão ({selectedService.commission_percentage}%)</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(calculateCommission(parseFloat(servicePrice) || selectedService.price, selectedService.commission_percentage))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor do serviço</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(servicePrice) || selectedService.price)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!selectedService || isSubmitting || !!closureWarning}
            >
              {isSubmitting ? 'Registrando...' : 'Confirmar Atendimento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}