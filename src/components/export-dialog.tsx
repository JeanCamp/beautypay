'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToCSV, exportToExcel, exportToPDF, generateFortnightReport, ExportData } from '@/lib/export';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExportData;
  title?: string;
  fortnightInfo?: {
    start: string;
    end: string;
    number: number;
    month: number;
    year: number;
  };
}

export default function ExportDialog({ open, onOpenChange, data, title = 'Exportar Dados', fortnightInfo }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (fortnightInfo) {
        const report = generateFortnightReport(data, fortnightInfo);
        switch (format) {
          case 'csv':
            report.csv();
            break;
          case 'excel':
            report.excel();
            break;
          case 'pdf':
            report.pdf();
            break;
        }
      } else {
        switch (format) {
          case 'csv':
            exportToCSV(data);
            break;
          case 'excel':
            exportToExcel(data);
            break;
          case 'pdf':
            exportToPDF(data);
            break;
        }
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato de Exportação</label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Resumo da exportação:</strong>
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• {data.appointments.length} atendimentos</li>
              <li>• {formatCurrency(data.summary?.totalServicesValue || data.appointments.reduce((sum, apt) => sum + apt.service_price, 0))} em serviços</li>
              <li>• {formatCurrency(data.summary?.totalCommission || data.appointments.reduce((sum, apt) => sum + apt.commission_amount, 0))} em comissões</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to format currency within the component
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}