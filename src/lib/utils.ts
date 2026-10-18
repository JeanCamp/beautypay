import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency to Brazilian Real
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  // Remove non-numeric characters except decimal separator
  const cleaned = value.replace(/[^\d,.-]/g, '');
  // Replace comma with dot for parsing
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
}

// Calculate commission amount
export function calculateCommission(price: number, percentage: number): number {
  // Use precise calculation to avoid floating point errors
  return Math.round((price * percentage) / 100 * 100) / 100;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Format date to Brazilian format
export function formatDate(date: string | Date): string {
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Format YYYY-MM-DD directly
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

// Format time only
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

// Get fortnight dates for a given month
export function getFortnightDates(year: number, month: number, fortnightNumber: 1 | 2): { start: Date; end: Date } {
  const start = new Date(year, month - 1, fortnightNumber === 1 ? 1 : 16);
  const end = new Date(year, month, fortnightNumber === 1 ? 15 : 0);
  return { start, end };
}

// Get current fortnight
export function getCurrentFortnight(): { year: number; month: number; fortnightNumber: 1 | 2 } {
  const now = new Date();
  const day = now.getDate();
  const fortnightNumber = day <= 15 ? 1 : 2;
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    fortnightNumber
  };
}

// Get week start and end dates
export function getWeekDates(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

// Get month start and end dates
export function getMonthDates(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

// Round to 2 decimal places (precise for currency)
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

// Calculate daily average
export function calculateDailyAverage(total: number, days: number): number {
  if (days === 0) return 0;
  return roundToTwoDecimals(total / days);
}

// Calculate progress percentage
export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

// Generate random ID for temporary purposes
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}