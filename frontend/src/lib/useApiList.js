import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// GET with retries. Render free instances cold-start (can take ~30-60s) and edge
// proxies may answer 429/502/503 meanwhile, so retry those with backoff.
async function getWithRetry(url, tries = 4) {
  let lastErr
  for (let i = 0; i < tries; i++) {
    try {
      const r = await axios.get(url, { timeout: 20000 })
      if (typeof r.data === 'string') throw new Error('Unexpected response (not JSON)')
      return r.data
    } catch (err) {
      lastErr = err
      const s = err.response?.status
      const retryable = !s || s === 429 || s >= 500
      if (!retryable || i === tries - 1) break
      await sleep(1500 * 2 ** i)
    }
  }
  throw lastErr
}

export default function useApiList(url) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getWithRetry(url)
      .then(d => { if (!cancelled) setData(Array.isArray(d) ? d : []) })
      .catch(e => { if (!cancelled) setError(e) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [url, attempt])

  const retry = useCallback(() => setAttempt(a => a + 1), [])
  return { data, loading, error, retry }
}
