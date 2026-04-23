'use client'

import { useState, useEffect } from 'react'

export default function FilingSelector({ company, onSelect }) {
  const [filings, setFilings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedAccession, setSelectedAccession] = useState(null)

  useEffect(() => {
    async function fetchFilings() {
      setLoading(true)
      setError(null)
      setFilings([])
      setSelectedAccession(null)

      try {
        const res = await fetch('/api/fetch-filing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'list', cik: company.cik, formType: '10-K' }),
        })

        if (!res.ok) throw new Error('Failed to fetch filings')

        const data = await res.json()
        setFilings(data)
        if (data.length === 0) setError('No 10-K filings found.')
      } catch {
        setError('Failed to load filings. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchFilings()
  }, [company.cik])

  function handleFilingClick(filing) {
    setSelectedAccession(filing.accessionNumber)
    onSelect({ ...filing, formType: '10-K', cik: company.cik })
  }

  return (
    <div>
      {loading && (
        <p className="text-sm text-gray-400">Loading annual reports...</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {filings.length > 0 && (
        <>
          <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
            Recent Annual Reports (10-K)
          </h3>
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
            {filings.map((filing) => {
              const isSelected = selectedAccession === filing.accessionNumber
              return (
                <li key={filing.accessionNumber}>
                  <button
                    onClick={() => handleFilingClick(filing)}
                    className={`w-full px-5 py-4 text-left transition-colors hover:bg-red-50 focus:outline-none ${
                      isSelected
                        ? 'bg-red-50 border-l-4 border-red-600'
                        : 'border-l-4 border-transparent'
                    }`}
                  >
                    <span className="block font-medium text-gray-900">
                      Annual Report &mdash; {filing.date}
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-400">
                      {filing.accessionNumber}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
