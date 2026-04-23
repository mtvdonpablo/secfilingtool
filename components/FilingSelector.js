'use client'

import { useState } from 'react'

const FORM_TYPES = [
  {
    type: '10-K',
    tooltip: 'Annual Report — A comprehensive yearly overview of a company\'s financial performance, business operations, and risk factors. The most detailed filing companies make.',
  },
  {
    type: '10-Q',
    tooltip: 'Quarterly Report — A snapshot of financial performance filed three times a year (Q1, Q2, Q3). Less detailed than a 10-K but shows how the company is tracking throughout the year.',
  },
  {
    type: '8-K',
    tooltip: 'Current Report — Filed to disclose major events that shareholders should know about immediately, such as earnings releases, mergers, CEO changes, or other material news.',
  },
]

export default function FilingSelector({ company, onSelect }) {
  const [activeType, setActiveType] = useState(null)
  const [filings, setFilings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedAccession, setSelectedAccession] = useState(null)

  async function handleTypeClick(formType) {
    setActiveType(formType)
    setSelectedAccession(null)
    setFilings([])
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/fetch-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'list', cik: company.cik, formType }),
      })

      if (!res.ok) throw new Error('Failed to fetch filings')

      const data = await res.json()
      setFilings(data)
      if (data.length === 0) setError(`No ${formType} filings found.`)
    } catch {
      setError('Failed to load filings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleFilingClick(filing) {
    setSelectedAccession(filing.accessionNumber)
    onSelect({ ...filing, formType: activeType, cik: company.cik })
  }

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Select filing type
      </h2>

      <div className="flex gap-2">
        {FORM_TYPES.map(({ type, tooltip }) => (
          <div key={type} className="relative group">
            <button
              onClick={() => handleTypeClick(type)}
              className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors ${
                activeType === type
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {type}
            </button>
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {tooltip}
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <p className="mt-4 text-sm text-gray-400">Loading filings...</p>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {filings.length > 0 && (
        <>
          <h3 className="mt-5 mb-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
            Recent {activeType} filings
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
                      {activeType} &mdash; {filing.date}
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
