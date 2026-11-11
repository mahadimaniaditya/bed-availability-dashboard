import { z } from 'zod'
export const admitSchema = z.object({
  fullName: z.string().min(2, 'Enter a fictional patient name'),
  patientCode: z.string().min(3, 'Enter a demo patient ID'),
  age: z.string().regex(/^\d{1,3}$/, 'Enter an age from 0 to 120'),
  contactLabel: z.string().optional(),
  admissionAt: z.string().min(1, 'Choose date and time'),
  wardId: z.string().min(1, 'Select a ward'),
  bedId: z.string().min(1, 'Select an available bed'),
  note: z.string().optional(),
})
export const reserveSchema = z.object({
  patientLabel: z.string().min(2, 'Enter a patient label or demo ID'),
  expectedAt: z.string().min(1, 'Choose expected arrival'),
  note: z.string().optional(),
})
export const statusSchema = z.object({
  status: z.string().min(1),
  note: z.string().min(3, 'A reason is required for status changes'),
})
