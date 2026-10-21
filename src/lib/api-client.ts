// Supabase API for BeautyPay
// Sincroniza dados entre dispositivos usando Supabase PostgreSQL

import { supabase } from './supabase';

export interface Service {
  id: number;
  name: string;
  category?: string;
  price: number;
  commission_percentage: number;
  estimated_commission: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: number;
  client_name?: string;
  service_id: number;
  service_price: number;
  commission_percentage: number;
  commission_amount: number;
  payment_method?: string;
  appointment_date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DayClosure {
  id: number;
  closure_date: string;
  total_appointments: number;
  total_services_value: number;
  total_commission: number;
  is_closed: boolean;
  closed_at?: string;
  reopened_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FortnightClosure {
  id: number;
  start_date: string;
  end_date: string;
  year: number;
  month: number;
  fortnight_number: number;
  total_appointments: number;
  total_services_value: number;
  total_commission: number;
  amount_received: number;
  difference: number;
  notes?: string;
  is_closed: boolean;
  closed_at?: string;
  reopened_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Services API - Supabase
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  create: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: number, service: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    const { data, error } = await supabase
      .from('services')
      .update(service)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Appointments API - Supabase
export const appointmentsApi = {
  getAll: async (startDate?: string, endDate?: string): Promise<Appointment[]> => {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });
    
    if (startDate) {
      query = query.gte('appointment_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('appointment_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  create: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: number, appointment: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>): Promise<Appointment> => {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Day Closure API - Supabase
export const dayClosureApi = {
  getByDate: async (date: string): Promise<DayClosure | undefined> => {
    const { data, error } = await supabase
      .from('day_closures')
      .select('*')
      .eq('closure_date', date)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows returned
      throw error;
    }
    return data;
  },

  create: async (closure: Omit<DayClosure, 'id' | 'created_at' | 'updated_at'>): Promise<DayClosure> => {
    const { data, error } = await supabase
      .from('day_closures')
      .insert(closure)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getAll: async (): Promise<DayClosure[]> => {
    const { data, error } = await supabase
      .from('day_closures')
      .select('*')
      .order('closure_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  update: async (date: string, closure: Partial<Omit<DayClosure, 'id' | 'created_at' | 'updated_at'>>): Promise<DayClosure> => {
    // Check if exists first
    const existing = await dayClosureApi.getByDate(date);
    
    if (existing) {
      const { data, error } = await supabase
        .from('day_closures')
        .update(closure)
        .eq('closure_date', date)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new
      return dayClosureApi.create({
        ...closure,
        closure_date: date,
        total_appointments: 0,
        total_services_value: 0,
        total_commission: 0,
        is_closed: false
      });
    }
  }
};

// Fortnight Closure API - Supabase
export const fortnightClosureApi = {
  getByPeriod: async (year: number, month: number, fortnightNumber: number): Promise<FortnightClosure | undefined> => {
    const { data, error } = await supabase
      .from('fortnight_closures')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .eq('fortnight_number', fortnightNumber)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows returned
      throw error;
    }
    return data;
  },

  create: async (closure: Omit<FortnightClosure, 'id' | 'created_at' | 'updated_at'>): Promise<FortnightClosure> => {
    const { data, error } = await supabase
      .from('fortnight_closures')
      .insert(closure)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getAll: async (): Promise<FortnightClosure[]> => {
    const { data, error } = await supabase
      .from('fortnight_closures')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .order('fortnight_number', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  update: async (year: number, month: number, fortnightNumber: number, closure: Partial<Omit<FortnightClosure, 'id' | 'created_at' | 'updated_at'>>): Promise<FortnightClosure> => {
    // Check if exists first
    const existing = await fortnightClosureApi.getByPeriod(year, month, fortnightNumber);
    
    if (existing) {
      const { data, error } = await supabase
        .from('fortnight_closures')
        .update(closure)
        .eq('year', year)
        .eq('month', month)
        .eq('fortnight_number', fortnightNumber)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new
      return fortnightClosureApi.create({
        ...closure,
        year,
        month,
        fortnight_number: fortnightNumber,
        start_date: '',
        end_date: '',
        total_appointments: 0,
        total_services_value: 0,
        total_commission: 0,
        amount_received: closure.amount_received || 0,
        difference: closure.difference || 0,
        notes: closure.notes,
        is_closed: false
      });
    }
  }
};
