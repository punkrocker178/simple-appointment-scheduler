import type { Service, Technician, ServiceBay } from './types';

export const SERVICES: Service[] = [
  { id: 1, name: 'Oil Change', durationMinutes: 60, requiredSkill: 'basic' },
  { id: 2, name: 'Full Service', durationMinutes: 120, requiredSkill: 'intermediate' },
  { id: 3, name: 'Major Service', durationMinutes: 180, requiredSkill: 'advanced' },
];

export const TECHNICIANS: Technician[] = [
  { id: 'tech-1', name: 'John Smith', skill: 'basic' },
  { id: 'tech-2', name: 'Jane Doe', skill: 'intermediate' },
  { id: 'tech-3', name: 'Mike Wilson', skill: 'advanced' },
];

export const SERVICE_BAYS: ServiceBay[] = [
  { id: 'bay-1', name: 'Bay 1' },
  { id: 'bay-2', name: 'Bay 2' },
  { id: 'bay-3', name: 'Bay 3' },
  { id: 'bay-4', name: 'Bay 4' },
];

export const OPERATING_HOURS = { startHour: 8, endHour: 18 }; // 08:00 - 18:00
export const OPERATING_DAYS = [1, 2, 3, 4, 5, 6]; // Monday (1) - Saturday (6)
export const SAME_DAY_MIN_HOURS = 2;
