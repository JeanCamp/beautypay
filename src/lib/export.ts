// Export functions for BeautyPay
// Simplified to work with localStorage data

import { Appointment } from './api-client';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils';

export interface ExportData {
  appointments: Appointment[];
  services?: any[];
  summary?: {
    totalAppointments?: number;
    totalServicesValue: number;
    totalCommission: number;
  };
}

export function exportToCSV(data: ExportData) {
  const headers = ['Data', 'Cliente', 'Serviço', 'Valor', 'Comissão %', 'Comissão', 'Pagamento'];
  const rows = data.appointments.map(apt => {
    const aptDate = new Date(apt.appointment_date);
    const dateStr = !isNaN(aptDate.getTime()) ? formatDate(aptDate) : apt.appointment_date;
    return [
      dateStr,
      apt.client_name || 'N/A',
      apt.service_id.toString(),
      formatCurrency(apt.service_price),
      `${apt.commission_percentage}%`,
      formatCurrency(apt.commission_amount),
      apt.payment_method || 'N/A'
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `beautypay_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportToExcel(data: ExportData) {
  const rows = data.appointments.map(apt => {
    const aptDate = new Date(apt.appointment_date);
    const dateStr = !isNaN(aptDate.getTime()) ? formatDate(aptDate) : apt.appointment_date;
    return {
      'Data': dateStr,
      'Cliente': apt.client_name || 'N/A',
      'Serviço ID': apt.service_id,
      'Valor': apt.service_price,
      'Comissão %': apt.commission_percentage,
      'Comissão': apt.commission_amount,
      'Pagamento': apt.payment_method || 'N/A'
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos');
  XLSX.writeFile(wb, `beautypay_export_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToPDF(data: ExportData) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('BeautyPay - Relatório de Atendimentos', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Data: ${formatDate(new Date())}`, 14, 30);
  doc.text(`Total de atendimentos: ${data.appointments.length}`, 14, 38);
  
  if (data.summary) {
    doc.text(`Valor total: ${formatCurrency(data.summary.totalServicesValue)}`, 14, 46);
    doc.text(`Comissão total: ${formatCurrency(data.summary.totalCommission)}`, 14, 54);
  }

  let y = 70;
  doc.setFontSize(10);
  doc.text('Data', 14, y);
  doc.text('Cliente', 40, y);
  doc.text('Valor', 100, y);
  doc.text('Comissão', 140, y);
  
  y += 8;
  data.appointments.forEach((apt, index) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    const aptDate = new Date(apt.appointment_date);
    const dateStr = !isNaN(aptDate.getTime()) ? formatDate(aptDate) : apt.appointment_date;
    doc.text(dateStr, 14, y);
    doc.text((apt.client_name || 'N/A').substring(0, 20), 40, y);
    doc.text(formatCurrency(apt.service_price), 100, y);
    doc.text(formatCurrency(apt.commission_amount), 140, y);
    y += 7;
  });

  doc.save(`beautypay_export_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateFortnightReport(data: ExportData, fortnightInfo: {
  start: string;
  end: string;
  number: number;
  month: number;
  year: number;
}) {
  const csv = () => exportToCSV(data);
  const excel = () => exportToExcel(data);
  const pdf = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('BeautyPay - Relatório de Quinzena', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Quinzena ${fortnightInfo.number} - ${fortnightInfo.month}/${fortnightInfo.year}`, 14, 30);
    
    const startDate = new Date(fortnightInfo.start);
    const endDate = new Date(fortnightInfo.end);
    const startStr = !isNaN(startDate.getTime()) ? formatDate(startDate) : fortnightInfo.start;
    const endStr = !isNaN(endDate.getTime()) ? formatDate(endDate) : fortnightInfo.end;
    
    doc.text(`Período: ${startStr} a ${endStr}`, 14, 38);
    doc.text(`Total de atendimentos: ${data.appointments.length}`, 14, 46);
    
    if (data.summary) {
      doc.text(`Valor total: ${formatCurrency(data.summary.totalServicesValue)}`, 14, 54);
      doc.text(`Comissão total: ${formatCurrency(data.summary.totalCommission)}`, 14, 62);
    }

    let y = 80;
    doc.setFontSize(10);
    doc.text('Data', 14, y);
    doc.text('Cliente', 40, y);
    doc.text('Valor', 100, y);
    doc.text('Comissão', 140, y);
    
    y += 8;
    data.appointments.forEach((apt) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const aptDate = new Date(apt.appointment_date);
      const dateStr = !isNaN(aptDate.getTime()) ? formatDate(aptDate) : apt.appointment_date;
      doc.text(dateStr, 14, y);
      doc.text((apt.client_name || 'N/A').substring(0, 20), 40, y);
      doc.text(formatCurrency(apt.service_price), 100, y);
      doc.text(formatCurrency(apt.commission_amount), 140, y);
      y += 7;
    });

    doc.save(`beautypay_quinzena_${fortnightInfo.number}_${fortnightInfo.month}_${fortnightInfo.year}.pdf`);
  };

  return { csv, excel, pdf };
}
