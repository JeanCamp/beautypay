// Local storage API for BeautyPay
// Simplified to work directly with localStorage for appointments and services

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

// Local storage helpers
const STORAGE_KEYS = {
  SERVICES: 'beautypay_services',
  APPOINTMENTS: 'beautypay_appointments',
  DAY_CLOSURES: 'beautypay_day_closures',
  FORTNIGHT_CLOSURES: 'beautypay_fortnight_closures'
};

const getNextId = (items: any[]): number => {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
};

// Services API
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return data ? JSON.parse(data) : [];
  },

  create: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
    const services = await servicesApi.getAll();
    const newService: Service = {
      ...service,
      id: getNextId(services),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    services.push(newService);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return newService;
  },

  update: async (id: number, service: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    const services = await servicesApi.getAll();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    
    services[index] = {
      ...services[index],
      ...service,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return services[index];
  },

  delete: async (id: number): Promise<void> => {
    const services = await servicesApi.getAll();
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
  }
};

// Appointments API
export const appointmentsApi = {
  getAll: async (startDate?: string, endDate?: string): Promise<Appointment[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    let appointments: Appointment[] = data ? JSON.parse(data) : [];
    
    if (startDate || endDate) {
      appointments = appointments.filter(apt => {
        if (startDate && apt.appointment_date < startDate) return false;
        if (endDate && apt.appointment_date > endDate) return false;
        return true;
      });
    }
    
    return appointments.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
  },

  create: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    const appointments = await appointmentsApi.getAll();
    const newAppointment: Appointment = {
      ...appointment,
      id: getNextId(appointments),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    appointments.push(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return newAppointment;
  },

  update: async (id: number, appointment: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>): Promise<Appointment> => {
    const appointments = await appointmentsApi.getAll();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    
    appointments[index] = {
      ...appointments[index],
      ...appointment,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return appointments[index];
  },

  delete: async (id: number): Promise<void> => {
    const appointments = await appointmentsApi.getAll();
    const filtered = appointments.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
  }
};

// Day Closure API
export const dayClosureApi = {
  getByDate: async (date: string): Promise<DayClosure | undefined> => {
    const data = localStorage.getItem(STORAGE_KEYS.DAY_CLOSURES);
    const closures: DayClosure[] = data ? JSON.parse(data) : [];
    return closures.find(c => c.closure_date === date);
  },

  create: async (closure: Omit<DayClosure, 'id' | 'created_at' | 'updated_at'>): Promise<DayClosure> => {
    const closures = await dayClosureApi.getAll();
    const newClosure: DayClosure = {
      ...closure,
      id: getNextId(closures),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    closures.push(newClosure);
    localStorage.setItem(STORAGE_KEYS.DAY_CLOSURES, JSON.stringify(closures));
    return newClosure;
  },

  getAll: async (): Promise<DayClosure[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.DAY_CLOSURES);
    return data ? JSON.parse(data) : [];
  },

  update: async (date: string, closure: Partial<Omit<DayClosure, 'id' | 'created_at' | 'updated_at'>>): Promise<DayClosure> => {
    const closures = await dayClosureApi.getAll();
    const index = closures.findIndex(c => c.closure_date === date);
    
    if (index === -1) {
      // Create new closure if doesn't exist
      const newClosure: DayClosure = {
        id: getNextId(closures),
        closure_date: date,
        total_appointments: 0,
        total_services_value: 0,
        total_commission: 0,
        is_closed: false,
        ...closure,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      closures.push(newClosure);
      localStorage.setItem(STORAGE_KEYS.DAY_CLOSURES, JSON.stringify(closures));
      return newClosure;
    }
    
    closures[index] = {
      ...closures[index],
      ...closure,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.DAY_CLOSURES, JSON.stringify(closures));
    return closures[index];
  }
};

// Fortnight Closure API
export const fortnightClosureApi = {
  getByPeriod: async (year: number, month: number, fortnightNumber: number): Promise<FortnightClosure | undefined> => {
    const data = localStorage.getItem(STORAGE_KEYS.FORTNIGHT_CLOSURES);
    const closures: FortnightClosure[] = data ? JSON.parse(data) : [];
    return closures.find(c => 
      c.year === year && 
      c.month === month && 
      c.fortnight_number === fortnightNumber
    );
  },

  create: async (closure: Omit<FortnightClosure, 'id' | 'created_at' | 'updated_at'>): Promise<FortnightClosure> => {
    const closures = await fortnightClosureApi.getAll();
    const newClosure: FortnightClosure = {
      ...closure,
      id: getNextId(closures),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    closures.push(newClosure);
    localStorage.setItem(STORAGE_KEYS.FORTNIGHT_CLOSURES, JSON.stringify(closures));
    return newClosure;
  },

  getAll: async (): Promise<FortnightClosure[]> => {
    const data = localStorage.getItem(STORAGE_KEYS.FORTNIGHT_CLOSURES);
    return data ? JSON.parse(data) : [];
  },

  update: async (year: number, month: number, fortnightNumber: number, closure: Partial<Omit<FortnightClosure, 'id' | 'created_at' | 'updated_at'>>): Promise<FortnightClosure> => {
    const closures = await fortnightClosureApi.getAll();
    const index = closures.findIndex(c => 
      c.year === year && 
      c.month === month && 
      c.fortnight_number === fortnightNumber
    );
    
    if (index === -1) {
      // Create new closure if doesn't exist
      const newClosure: FortnightClosure = {
        id: getNextId(closures),
        start_date: '',
        end_date: '',
        year,
        month,
        fortnight_number: fortnightNumber,
        total_appointments: 0,
        total_services_value: 0,
        total_commission: 0,
        amount_received: closure.amount_received || 0,
        difference: closure.difference || 0,
        notes: closure.notes,
        is_closed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      closures.push(newClosure);
      localStorage.setItem(STORAGE_KEYS.FORTNIGHT_CLOSURES, JSON.stringify(closures));
      return newClosure;
    }
    
    closures[index] = {
      ...closures[index],
      ...closure,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.FORTNIGHT_CLOSURES, JSON.stringify(closures));
    return closures[index];
  }
};
