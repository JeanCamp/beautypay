// Pre-configured services for BeautyPay
import { servicesApi, Service } from './api-client';
import { calculateCommission } from './utils';

const services = [
  { name: 'Corte bordado', category: 'Corte', price: 180, commission_percentage: 40 },
  { name: 'Cauterização (a partir)', category: 'Química', price: 210, commission_percentage: 40 },
  { name: 'Progressiva orgânica (a partir)', category: 'Química', price: 350, commission_percentage: 30 },
  { name: 'Secagem curto', category: 'Secagem', price: 25, commission_percentage: 40 },
  { name: 'Corte franja', category: 'Corte', price: 50, commission_percentage: 40 },
  { name: 'Corte feminino', category: 'Corte', price: 100, commission_percentage: 40 },
  { name: 'Secagem extra longo', category: 'Secagem', price: 45, commission_percentage: 40 },
  { name: 'Secagem médio', category: 'Secagem', price: 35, commission_percentage: 40 },
  { name: 'Secagem longo', category: 'Secagem', price: 45, commission_percentage: 40 },
  { name: 'Escova modeladora', category: 'Escova', price: 130, commission_percentage: 40 },
  { name: 'Escova curta', category: 'Escova', price: 65, commission_percentage: 40 },
  { name: 'Escova longa', category: 'Escova', price: 80, commission_percentage: 40 },
  { name: 'Escova extra longa', category: 'Escova', price: 95, commission_percentage: 40 },
  { name: 'Escova média', category: 'Escova', price: 75, commission_percentage: 40 },
  { name: 'Tratamento Truss c/ escova', category: 'Tratamento', price: 165, commission_percentage: 40 },
  { name: 'Shampoozada', category: 'Lavagem', price: 150, commission_percentage: 30 },
  { name: 'Lavagem especial – curto', category: 'Lavagem', price: 20, commission_percentage: 40 },
  { name: 'Lavagem especial – médio', category: 'Lavagem', price: 25, commission_percentage: 40 },
  { name: 'Lavagem especial – longo', category: 'Lavagem', price: 30, commission_percentage: 40 },
  { name: 'Luzes (a partir)', category: 'Química', price: 700, commission_percentage: 30 },
  { name: 'Lavagem – curto', category: 'Lavagem', price: 15, commission_percentage: 40 },
  { name: 'Lavagem – médio', category: 'Lavagem', price: 20, commission_percentage: 40 },
  { name: 'Lavagem – longo', category: 'Lavagem', price: 30, commission_percentage: 40 },
  { name: 'Botox médio', category: 'Química', price: 320, commission_percentage: 30 },
  { name: 'Botox longo', category: 'Química', price: 350, commission_percentage: 30 },
  { name: 'Botox extra longo', category: 'Química', price: 380, commission_percentage: 30 },
  { name: 'Coloração cabelo inteiro (a partir)', category: 'Química', price: 350, commission_percentage: 30 },
  { name: 'Hidratação simples c/ escova', category: 'Tratamento', price: 110, commission_percentage: 40 },
  { name: 'Hidratação LOreal e Wella c/ escova', category: 'Tratamento', price: 160, commission_percentage: 40 },
  { name: 'Hidratação Kérastase e Redken c/ escova', category: 'Tratamento', price: 250, commission_percentage: 40 },
  { name: 'Hidratação Hidragloss (a partir)', category: 'Tratamento', price: 350, commission_percentage: 40 },
  { name: 'Vinhoterapia – curto', category: 'Tratamento', price: 290, commission_percentage: 30 },
  { name: 'Vinhoterapia – médio', category: 'Tratamento', price: 320, commission_percentage: 30 },
  { name: 'Vinhoterapia – longo', category: 'Tratamento', price: 350, commission_percentage: 30 },
  { name: 'Vinhoterapia – extra longo', category: 'Tratamento', price: 350, commission_percentage: 30 },
  { name: 'Botox curto', category: 'Química', price: 290, commission_percentage: 30 },
  { name: 'Plástica capilar (a partir)', category: 'Química', price: 210, commission_percentage: 30 },
  { name: 'Retoque de raiz (coloração cliente)', category: 'Química', price: 130, commission_percentage: 30 },
  { name: 'Retoque de raiz (coloração salão)', category: 'Química', price: 160, commission_percentage: 30 },
];

export const PRE_CONFIGURED_SERVICES: Omit<Service, 'id' | 'created_at' | 'updated_at'>[] = services.map(service => ({
  ...service,
  estimated_commission: calculateCommission(service.price, service.commission_percentage),
  is_active: true
}));

export async function initializeServices() {
  const existingServices = await servicesApi.getAll();
  
  // Only initialize if no services exist
  if (existingServices.length === 0) {
    console.log('Initializing pre-configured services...');
    for (const service of PRE_CONFIGURED_SERVICES) {
      await servicesApi.create(service);
    }
    console.log(`Initialized ${PRE_CONFIGURED_SERVICES.length} services`);
  }
}
