import { api } from './api'
import type {
  Clinic,
  CreateClinicPayload,
  CreateHmrReviewPayload,
  CreatePatientPayload,
  CreatePrescriberPayload,
  HmrReview,
  Patient,
  Prescriber,
} from '../types/hmr'

const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>
) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const fetchPatients = async (search?: string) => {
  const query = buildQueryString({ search })
  const response = await api.get<Patient[]>(`/patients${query}`)
  return response
}

export const createPatient = async (payload: CreatePatientPayload) => {
  const response = await api.post<Patient>('/patients', payload)
  return response
}

export const updatePatient = async (
  id: number,
  payload: Partial<CreatePatientPayload>
) => {
  const response = await api.patch<Patient>(`/patients/${id}`, payload)
  return response
}

export const deletePatient = async (id: number) => {
  await api.delete<void>(`/patients/${id}`)
}

export const fetchPrescribers = async () => {
  const response = await api.get<Prescriber[]>('/prescribers')
  return response
}

export const createPrescriber = async (payload: CreatePrescriberPayload) => {
  const response = await api.post<Prescriber>('/prescribers', payload)
  return response
}

export const updatePrescriber = async (
  id: number,
  payload: Partial<CreatePrescriberPayload> & { clinicId?: number | null }
) => {
  const response = await api.patch<Prescriber>(`/prescribers/${id}`, payload)
  return response
}

export const deletePrescriber = async (id: number) => {
  await api.delete<void>(`/prescribers/${id}`)
}

export const fetchClinics = async () => {
  const response = await api.get<Clinic[]>('/clinics')
  return response
}

export const createClinic = async (payload: CreateClinicPayload) => {
  const response = await api.post<Clinic>('/clinics', payload)
  return response
}

export const updateClinic = async (
  id: number,
  payload: Partial<CreateClinicPayload>
) => {
  const response = await api.patch<Clinic>(`/clinics/${id}`, payload)
  return response
}

export const deleteClinic = async (id: number) => {
  await api.delete<void>(`/clinics/${id}`)
}

export const fetchReviews = async (options?: {
  status?: string
  patientId?: number
  includeCompleted?: boolean
}) => {
  const query = buildQueryString({
    status: options?.status,
    patientId: options?.patientId,
    includeCompleted: options?.includeCompleted,
  })

  const response = await api.get<HmrReview[]>(`/hmr/reviews${query}`)
  return response
}

export const getHmrReviewById = async (id: number) => {
  const response = await api.get<HmrReview>(`/hmr/reviews/${id}`)
  return response
}

export const createHmrReview = async (payload: CreateHmrReviewPayload) => {
  const response = await api.post<HmrReview>('/hmr/reviews', payload)
  return response
}

export const updateHmrReview = async (
  id: number,
  payload: Partial<CreateHmrReviewPayload>
) => {
  const response = await api.patch<HmrReview>(`/hmr/reviews/${id}`, payload)
  return response
}

export const deleteHmrReview = async (id: number) => {
  await api.delete<void>(`/hmr/reviews/${id}`)
}
