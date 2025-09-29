import { useState, useEffect, useCallback } from 'react'

interface CrudResourceOptions {
  ownerId?: number | string
  baseUrl: string
}

export function useCrudResource<T>(options: CrudResourceOptions) {
  const { ownerId, baseUrl } = options
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = ownerId ? `${baseUrl}?ownerId=${ownerId}` : baseUrl
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [baseUrl, ownerId])

  // Create
  const create = useCallback(
    async (payload: Partial<T>) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, ownerId }),
        })
        if (!res.ok) throw new Error('Failed to create')
        await fetchAll()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, ownerId, fetchAll]
  )

  // Update
  const update = useCallback(
    async (id: string | number, payload: Partial<T>) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${baseUrl}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, ownerId }),
        })
        if (!res.ok) throw new Error('Failed to update')
        await fetchAll()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, ownerId, fetchAll]
  )

  // Delete
  const remove = useCallback(
    async (id: string | number) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${baseUrl}/${id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete')
        await fetchAll()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [baseUrl, fetchAll]
  )

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { data, loading, error, fetchAll, create, update, remove }
}
