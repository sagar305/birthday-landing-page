import { useEffect, useState } from 'react'

export function useConfig(url = '/config.json') {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load config: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  return { config, error }
}
