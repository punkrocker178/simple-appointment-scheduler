// Shared domain types for the mock scheduling server

export interface Service {
  id:number 
  name: string
  durationMinutes: number
  requiredSkill: string
}

export interface Technician {
  id: string
  name: string
  skill: string
}

export interface ServiceBay {
  id: string
  name: string
}

export interface Slot {
  startTime: number // Unix timestamp in milliseconds
  endTime: number // Unix timestamp in milliseconds
  available: boolean
  technicianId?: string
  bayId?: string
}

export interface Appointment {
  id: string
  serviceId: string
  startTime: number // Unix timestamp in milliseconds
  endTime: number // Unix timestamp in milliseconds
  vehiclePlate: string
  vehicleMake?: string
  vehicleModel?: string
  customerName: string
  customerEmail: string
  bookingReference: string
  technicianId?: string
  bayId?: string
}

export interface ConflictCheckResult {
  hasConflict: boolean
  reason?: string
  assignedTechnicianId?: string
  assignedBayId?: string
}

export interface AvailabilityResponse {
  slots: Slot[]
}
