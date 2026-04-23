'use client'

import { useState } from 'react'

export default function SearchForm({ onResults }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/search-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: query }),
      })

      if (!res.ok) throw new Error('Search failed')

      const results = await res.json()
      onResults(results)
    } catch {
      setError('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company name..."
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}
