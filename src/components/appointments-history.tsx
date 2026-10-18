'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, formatPercentage, formatDate, formatTime, formatDateTime, getCurrentFortnight } from '@/lib/utils';
import { appointmentsApi, servicesApi, dayClosureApi, fortnightClosureApi, Appointment, Service } from '@/lib/api-client';
import { Search, Filter, Edit, Trash2, Calendar, User, Scissors, Download } from 'lucide-react';

export default function AppointmentsHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editFormData, setEditFormData] = useState({
    client_name: '',
    service_price: '',
    commission_percentage: '',
    notes: ''
  });
  const [closedDates, setClosedDates] = useState<Set<string>>(new Set());
  const [closedFortnights, setClosedFortnights] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, periodFilter, serviceFilter]);

  const loadData = async () => {
    try {
      const allAppointments = await appointmentsApi.getAll();
      const allServices = await servicesApi.getAll();
      setAppointments(allAppointments);
      setServices(allServices);

      // Load closed dates
      const dayClosures = await dayClosureApi.getAll();
      const closedDateSet = new Set(dayClosures
        .filter(closure => closure.is_closed)
        .map(closure => closure.closure_date)
      );
      setClosedDates(closedDateSet);

      // Load closed fortnights
      const fortnightClosures = await fortnightClosureApi.getAll();
      const closedFortnightSet = new Set(fortnightClosures
        .filter(closure => closure.is_closed)
        .map(closure => `${closure.year}-${closure.month}-${closure.fortnight_number}`)
      );
      setClosedFortnights(closedFortnightSet);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => {
        const service = services.find(s => s.id === apt.service_id);
        return (
          (apt.client_name && apt.client_name.toLowerCase().includes(term)) ||
          (service && service.name.toLowerCase().includes(term))
        );
      });
    }

    // Period filter
    if (periodFilter !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      filtered = filtered.filter(apt => {
        const aptDate = apt.appointment_date.split('T')[0];
        
        switch (periodFilter) {
          case 'today':
            return aptDate === todayStr;
          case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return aptDate === yesterday.toISOString().split('T')[0];
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return aptDate >= weekAgo.toISOString().split('T')[0];
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return aptDate >= monthAgo.toISOString().split('T')[0];
          default:
            return true;
        }
      });
    }

    // Service filter
    if (serviceFilter !== 'all') {
      filtered = filtered.filter(apt => apt.service_id === parseInt(serviceFilter));
    }

    setFilteredAppointments(filtered);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        await appointmentsApi.delete(appointmentToDelete.id);
        loadData();
        setShowDeleteDialog(false);
        setAppointmentToDelete(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditFormData({
      client_name: appointment.client_name || '',
      service_price: appointment.service_price.toString(),
      commission_percentage: appointment.commission_percentage.toString(),
      notes: appointment.notes || ''
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAppointment) return;

    try {
      await appointmentsApi.update(editingAppointment.id, {
        client_name: editFormData.client_name || undefined,
        service_price: parseFloat(editFormData.service_price),
        commission_percentage: parseFloat(editFormData.commission_percentage),
        commission_amount: (parseFloat(editFormData.service_price) * parseFloat(editFormData.commission_percentage)) / 100,
        notes: editFormData.notes || undefined
      });
      
      loadData();
      setShowEditDialog(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Serviço não encontrado';
  };

  const getFortnightForDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const fortnightNumber = day <= 15 ? 1 : 2;
    return `${year}-${month}-${fortnightNumber}`;
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Horário', 'Cliente', 'Serviço', 'Valor', 'Comissão %', 'Comissão'];
    const rows = filteredAppointments.map(apt => [
      formatDate(apt.appointment_date),
      formatTime(apt.appointment_date),
      apt.client_name || '-',
      getServiceName(apt.service_id),
      formatCurrency(apt.service_price),
      formatPercentage(apt.commission_percentage),
      formatCurrency(apt.commission_amount)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atendimentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Atendimentos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAppointments.length} de {appointments.length} atendimentos
          </p>
        </div>
        
        <Button
          onClick={exportToCSV}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={periodFilter} onValueChange={(value) => value && setPeriodFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Período">
                  {periodFilter === 'all' ? 'Todos os períodos' :
                   periodFilter === 'today' ? 'Hoje' :
                   periodFilter === 'yesterday' ? 'Ontem' :
                   periodFilter === 'week' ? 'Esta semana' :
                   periodFilter === 'month' ? 'Este mês' : 'Período'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={(value) => value && setServiceFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Serviço">
                  {serviceFilter === 'all' ? 'Todos os serviços' :
                   services.find(s => s.id.toString() === serviceFilter)?.name || 'Serviço'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Horário</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum atendimento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => {
                    const appointmentDate = appointment.appointment_date.split('T')[0];
                    const isDayClosed = closedDates.has(appointmentDate);
                    const fortnightKey = getFortnightForDate(appointment.appointment_date);
                    const isFortnightClosed = closedFortnights.has(fortnightKey);

                    return (
                      <TableRow key={appointment.id} className={isDayClosed || isFortnightClosed ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
                            <div className="text-gray-500">{formatTime(appointment.appointment_date)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.client_name ? (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              {appointment.client_name}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Scissors className="w-4 h-4 mr-2 text-purple-600" />
                            {getServiceName(appointment.service_id)}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(appointment.service_price)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline">{formatPercentage(appointment.commission_percentage)}</Badge>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(appointment.commission_amount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {isDayClosed && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Dia Fechado
                              </Badge>
                            )}
                            {isFortnightClosed && !isDayClosed && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                                Quinzena Fechada
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(appointment)}
                              disabled={isDayClosed || isFortnightClosed}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(appointment)}
                              className="text-red-600 hover:text-red-700"
                              disabled={isDayClosed || isFortnightClosed}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 dark:text-gray-300">
            Tem certeza que deseja excluir este atendimento? Esta ação não pode ser desfeita.
          </p>
          {appointmentToDelete && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm"><strong>Serviço:</strong> {getServiceName(appointmentToDelete.service_id)}</p>
              <p className="text-sm"><strong>Valor:</strong> {formatCurrency(appointmentToDelete.service_price)}</p>
              <p className="text-sm"><strong>Comissão:</strong> {formatCurrency(appointmentToDelete.commission_amount)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atendimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Input
                value={editFormData.client_name}
                onChange={(e) => setEditFormData({ ...editFormData, client_name: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor do Serviço</label>
              <Input
                type="number"
                step="0.01"
                value={editFormData.service_price}
                onChange={(e) => setEditFormData({ ...editFormData, service_price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Porcentagem de Comissão</label>
              <Input
                type="number"
                step="1"
                min="0"
                max="100"
                value={editFormData.commission_percentage}
                onChange={(e) => setEditFormData({ ...editFormData, commission_percentage: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <Input
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Observações"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}