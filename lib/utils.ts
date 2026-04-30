import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMeetLink(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const seg = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  // Jitsi Meet: le stanze vengono create automaticamente senza API
  return `https://meet.jit.si/TutorMatch-${seg(4)}-${seg(4)}-${seg(4)}`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function getMonthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleDateString('it-IT', { month: 'long' })
}

export function isSlotPast(date: string, endTime: string): boolean {
  const slotEnd = new Date(`${date}T${endTime}`)
  return new Date() > new Date(slotEnd.getTime() + 60 * 1000)
}

/** Slot non prenotabile: inizia entro 12 ore dal momento attuale */
export function isSlotTooSoon(date: string, startTime: string): boolean {
  const slotStart = new Date(`${date}T${startTime}`)
  const twelveHoursFromNow = new Date(Date.now() + 12 * 60 * 60 * 1000)
  return slotStart < twelveHoursFromNow
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const GRADE_LABELS: Record<string, string> = {
  medie: 'Scuola Media',
  superiori: 'Scuola Superiore',
  universita: 'Università',
}

export const MODE_LABELS: Record<string, string> = {
  online: 'Online',
  presenza: 'In presenza',
  entrambe: 'Online e In presenza',
}
