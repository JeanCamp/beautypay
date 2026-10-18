'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, calculateCommission } from '@/lib/utils';
import { servicesApi, Service } from '@/lib/api-client';
import { Plus, Edit, Trash2, Search, Scissors } from 'lucide-react';

export default function ServicesCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    commission_percentage: ''
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm]);

  const loadServices = async () => {
    try {
      const allServices = await servicesApi.getAll();
      setServices(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const filterServices = () => {
    if (!searchTerm) {
      setFilteredServices(services);
      return;
    }
    
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.category && service.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredServices(filtered);
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        category: service.category || '',
        price: service.price.toString(),
        commission_percentage: service.commission_percentage.toString()
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        commission_percentage: ''
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingService(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      commission_percentage: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price);
    const commissionPercentage = parseFloat(formData.commission_percentage);
    const estimatedCommission = calculateCommission(price, commissionPercentage);

    try {
      if (editingService) {
        await servicesApi.update(editingService.id, {
          name: formData.name,
          category: formData.category || undefined,
          price,
          commission_percentage: commissionPercentage,
          estimated_commission: estimatedCommission
        });
      } else {
        await servicesApi.create({
          name: formData.name,
          category: formData.category || undefined,
          price,
          commission_percentage: commissionPercentage,
          estimated_commission: estimatedCommission,
          is_active: true
        });
      }
      
      loadServices();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (service: Service) => {
    if (confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
      try {
        await servicesApi.delete(service.id);
        loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catálogo de Serviços</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {services.length} serviços cadastrados
          </p>
        </div>
        
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Ela Recebe</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Scissors className="w-4 h-4 mr-2 text-purple-600" />
                          {service.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.category ? (
                          <Badge variant="secondary">{service.category}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(service.price)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatPercentage(service.commission_percentage)}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(service.estimated_commission)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(service)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Escova"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                type="text"
                placeholder="Ex: Cortes"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço Padrão (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="Ex: 80.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Porcentagem de Comissão (%) *</Label>
              <Input
                id="commission"
                type="number"
                step="1"
                min="0"
                max="100"
                placeholder="Ex: 40"
                value={formData.commission_percentage}
                onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                required
              />
            </div>

            {formData.price && formData.commission_percentage && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Comissão estimada:</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(
                    calculateCommission(
                      parseFloat(formData.price),
                      parseFloat(formData.commission_percentage)
                    )
                  )}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {editingService ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}