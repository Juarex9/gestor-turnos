export type UserRole = 'admin' | 'manager' | 'employee'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Barber {
  id: string
  name: string
  photo_url: string | null
  specialties: string[]
  phone: string | null
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  description: string | null
  is_active: boolean
  created_at: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  client_name: string
  client_phone: string
  barber_id: string
  service_id: string
  scheduled_at: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
  updated_at: string
  barber?: Barber
  service?: Service
}

export interface BusinessSettings {
  _id?: string
  id?: string
  business_name: string
  address: string | null
  phone: string | null
  opening_time: string
  closing_time: string
  work_days: number[]
  slot_duration_minutes: number
  whatsapp_number: string
}

export interface WhatsAppMessage {
  from: string
  body: string
  timestamp: string
}
