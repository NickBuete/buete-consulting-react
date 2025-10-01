import { api } from './api'

export interface MedicationIndication {
  id: number
  indication: string
  usageCount: number
}

export interface Medication {
  id: number
  name: string
  genericName: string | null
  form: string | null
  strength: string | null
  route: string | null
  usageCount: number
  indications: MedicationIndication[]
}

export interface MedicationSearchResponse {
  results: Medication[]
  count: number
}

export interface PopularMedicationsResponse {
  medications: Medication[]
  count: number
}

export interface IndicationsSearchResponse {
  indications: string[]
  count: number
}

export interface CreateMedicationKnowledgeBaseInput {
  name: string
  genericName?: string
  form?: string
  strength?: string
  route?: string
  indication?: string
  notes?: string
}

/**
 * Search medications by name, generic name, or indication
 * @param query - Search query (min 2 characters)
 * @param limit - Max results to return (default 20)
 */
export const searchMedications = async (
  query: string,
  limit: number = 20
): Promise<Medication[]> => {
  const response = await api.get<MedicationSearchResponse>(
    `/medications/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )
  return response.results
}

/**
 * Get popular (most used) medications
 * @param limit - Max results to return (default 50)
 */
export const getPopularMedications = async (
  limit: number = 50
): Promise<Medication[]> => {
  const response = await api.get<PopularMedicationsResponse>(
    `/medications/popular?limit=${limit}`
  )
  return response.medications
}

/**
 * Search indications for autocomplete
 * @param query - Search query
 * @param limit - Max results to return (default 20)
 */
export const searchIndications = async (
  query: string,
  limit: number = 20
): Promise<string[]> => {
  const response = await api.get<IndicationsSearchResponse>(
    `/medications/indications/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}`
  )
  return response.indications
}

/**
 * Add medication to knowledge base
 * Automatically called when user adds a medication to an HMR
 * @param medication - Medication data to add
 */
export const addToKnowledgeBase = async (
  medication: CreateMedicationKnowledgeBaseInput
): Promise<Medication> => {
  return await api.post<Medication>('/medications/knowledge-base', medication)
}

/**
 * Get medication by ID with all indications
 * @param id - Medication ID
 */
export const getMedicationById = async (id: number): Promise<Medication> => {
  return await api.get<Medication>(`/medications/${id}`)
}
