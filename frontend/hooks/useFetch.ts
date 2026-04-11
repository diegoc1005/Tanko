import { useState, useEffect, useCallback } from 'react'

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFetch<T>(url: string, options?: RequestInit): FetchState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result.data || result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url, JSON.stringify(options)])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function usePost<T, R>(url: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const post = useCallback(async (data: T): Promise<R | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [url])

  return { post, loading, error }
}
