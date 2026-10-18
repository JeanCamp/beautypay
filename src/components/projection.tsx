'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency, calculateDailyAverage, calculateProgress, getMonthDates } from '@/lib/utils';
import { appointmentsApi, Appointment } from '@/lib/api-client';
import { TrendingUp, Target, Calendar, Zap, Edit, Save } from 'lucide-react';

export default function Projection() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [goals, setGoals] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [projection, setProjection] = useState<any>(null);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [editingGoals, setEditingGoals] = useState({ daily: '', weekly: '', monthly: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allAppointments = await appointmentsApi.getAll();
      setAppointments(allAppointments);
      
      // Load goals from localStorage
      const savedGoals = localStorage.getItem('userGoals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
        setEditingGoals({
          daily: parsedGoals.daily?.toString() || '',
          weekly: parsedGoals.weekly?.toString() || '',
          monthly: parsedGoals.monthly?.toString() || ''
        });
      }
      
      calculateProjection(allAppointments);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const calculateProjection = (allAppointments: Appointment[]) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const { start: monthStart, end: monthEnd } = getMonthDates(currentYear, currentMonth);
    
    // Get current month appointments
    const monthAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= monthStart && aptDate <= monthEnd;
    });
    
    const currentMonthCommission = monthAppointments.reduce((sum, apt) => sum + apt.commission_amount, 0);
    const daysPassed = now.getDate();
    const daysRemaining = new Date(currentYear, currentMonth, 0).getDate() - daysPassed;
    
    // Calculate daily average
    const dailyAverage = calculateDailyAverage(currentMonthCommission, daysPassed);
    
    // Project month end
    const projectedMonthTotal = currentMonthCommission + (dailyAverage * daysRemaining);
    
    // Calculate daily needed for goals
    const dailyNeededForMonthly = goals.monthly > 0 
      ? (goals.monthly - currentMonthCommission) / Math.max(1, daysRemaining)
      : 0;

    setProjection({
      currentMonthCommission,
      daysPassed,
      daysRemaining,
      dailyAverage,
      projectedMonthTotal,
      dailyNeededForMonthly,
      monthlyProgress: goals.monthly > 0 ? calculateProgress(currentMonthCommission, goals.monthly) : 0,
      monthlyRemaining: Math.max(0, goals.monthly - currentMonthCommission)
    });
  };

  const handleSaveGoals = () => {
    const newGoals = {
      daily: parseFloat(editingGoals.daily) || 0,
      weekly: parseFloat(editingGoals.weekly) || 0,
      monthly: parseFloat(editingGoals.monthly) || 0
    };
    
    setGoals(newGoals);
    localStorage.setItem('userGoals', JSON.stringify(newGoals));
    setShowGoalDialog(false);
    calculateProjection(appointments);
  };

  if (!projection) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projeção e Metas</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acompanhe seu progresso e projeções
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowGoalDialog(true)}
          className="gap-2"
        >
          <Edit className="w-4 h-4" />
          Editar Metas
        </Button>
      </div>

      {/* Monthly Goal Progress */}
      {goals.monthly > 0 && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Meta do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(projection.currentMonthCommission)} / {formatCurrency(goals.monthly)}
                </span>
                <span className="text-sm font-semibold text-purple-600">
                  {projection.monthlyProgress}%
                </span>
              </div>
              <Progress value={projection.monthlyProgress} className="h-3" />
            </div>
            
            {projection.monthlyRemaining > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Faltam {formatCurrency(projection.monthlyRemaining)} para atingir a meta
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {projection.daysRemaining} dias restantes
                </p>
                <p className="text-lg font-bold text-purple-600 mt-2">
                  {formatCurrency(projection.dailyNeededForMonthly)} por dia
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ganho Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(projection.currentMonthCommission)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {projection.daysPassed} dias trabalhados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Projeção do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(projection.projectedMonthTotal)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Se continuar neste ritmo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Média Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(projection.dailyAverage)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Baseado nos últimos {projection.daysPassed} dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Dias Restantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {projection.daysRemaining}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily/Weekly Goals */}
      {(goals.daily > 0 || goals.weekly > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.daily > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meta Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(goals.daily)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sua média atual: {formatCurrency(projection.dailyAverage)}
                </p>
                <Progress 
                  value={calculateProgress(projection.dailyAverage, goals.daily)} 
                  className="mt-3" 
                />
              </CardContent>
            </Card>
          )}

          {goals.weekly > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meta Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(goals.weekly)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Projeção semanal: {formatCurrency(projection.dailyAverage * 7)}
                </p>
                <Progress 
                  value={calculateProgress(projection.dailyAverage * 7, goals.weekly)} 
                  className="mt-3" 
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Goals Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Metas</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Meta Diária (R$)</Label>
              <Input
                id="dailyGoal"
                type="number"
                placeholder="Ex: 200"
                value={editingGoals.daily}
                onChange={(e) => setEditingGoals({ ...editingGoals, daily: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyGoal">Meta Semanal (R$)</Label>
              <Input
                id="weeklyGoal"
                type="number"
                placeholder="Ex: 1000"
                value={editingGoals.weekly}
                onChange={(e) => setEditingGoals({ ...editingGoals, weekly: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyGoal">Meta Mensal (R$)</Label>
              <Input
                id="monthlyGoal"
                type="number"
                placeholder="Ex: 4000"
                value={editingGoals.monthly}
                onChange={(e) => setEditingGoals({ ...editingGoals, monthly: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveGoals} className="gap-2">
              <Save className="w-4 h-4" />
              Salvar Metas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}