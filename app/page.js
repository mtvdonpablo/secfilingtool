'use client'

import { useState } from 'react'
import SearchForm from '@/components/SearchForm'
import CompanyResults from '@/components/CompanyResults'
import FilingSelector from '@/components/FilingSelector'
import AnalysisResult from '@/components/AnalysisResult'

const STEPS = ['Search', 'Select Company', 'Select Filing', 'Analyze']

export default function Home() {
  const [step, setStep] = useState(0)
  const [privateCompany, setPrivateCompany] = useState('')
  const [results, setResults] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedFiling, setSelectedFiling] = useState(null)
  const [filingText, setFilingText] = useState(null)
  const [fetchingDocument, setFetchingDocument] = useState(false)
  const [documentError, setDocumentError] = useState(null)

  function handleResults(companies) {
    setResults(companies)
    setSelectedCompany(null)
    setSelectedFiling(null)
    setFilingText(null)
    setStep(1)
  }

  function handleSelectCompany(company) {
    setSelectedCompany(company)
    setSelectedFiling(null)
    setFilingText(null)
    setStep(2)
  }

  async function handleSelectFiling(filing) {
    setSelectedFiling(filing)
    setFilingText(null)
    setFetchingDocument(true)
    setDocumentError(null)
    setStep(3)

    try {
      const res = await fetch('/api/fetch-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'document',
          cik: filing.cik,
          accessionNumber: filing.accessionNumber,
          primaryDocument: filing.primaryDocument,
        }),
      })

      if (!res.ok) throw new Error('Failed to fetch document')

      const { text } = await res.json()
      setFilingText(text)
    } catch {
      setDocumentError('Failed to fetch the filing document. Please try again.')
    } finally {
      setFetchingDocument(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold tracking-tight text-red-600">SEC</span>
              <span className="ml-1 text-2xl font-bold tracking-tight text-gray-900">FileTool</span>
            </div>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-1">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i <= step ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm transition-colors ${
                    i === step ? 'font-medium text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-px w-6 transition-colors ${
                      i < step ? 'bg-red-300' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {/* Slide 0: Search */}
          <div className="w-full flex-shrink-0 px-6 py-12">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Company Search</h1>
            <p className="mb-8 text-gray-500">
              Search for a publicly traded comparable company to analyze its SEC filings.
            </p>
            <SearchForm onResults={handleResults} />

            <div className="mt-8 border-t border-gray-100 pt-8">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Private company you&apos;re evaluating{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <p className="mb-3 text-sm text-gray-400">
                The AI will tailor its analysis to surface risks and insights relevant to this company.
              </p>
              <input
                type="text"
                value={privateCompany}
                onChange={(e) => setPrivateCompany(e.target.value)}
                placeholder="e.g. Wealthsimple"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
          </div>

          {/* Slide 1: Company results */}
          <div className="w-full flex-shrink-0 px-6 py-12">
            <h1 className="mb-6 text-3xl font-bold text-gray-900">Select a Company</h1>
            <CompanyResults
              companies={results}
              selectedCik={selectedCompany?.cik ?? null}
              onSelect={handleSelectCompany}
            />
          </div>

          {/* Slide 2: Filing selector */}
          <div className="w-full flex-shrink-0 px-6 py-12">
            <h1 className="mb-6 text-3xl font-bold text-gray-900">Select a Filing</h1>
            {selectedCompany && (
              <FilingSelector
                company={selectedCompany}
                onSelect={handleSelectFiling}
              />
            )}
          </div>

          {/* Slide 3: Analysis */}
          <div className="w-full flex-shrink-0 px-6 py-12">
            {selectedFiling && (
              <div className="mb-6">
                <p className="text-sm font-medium text-red-600">
                  {selectedCompany?.name}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedFiling.formType} &mdash; {selectedFiling.date}
                </p>
              </div>
            )}

            {fetchingDocument && (
              <p className="text-sm text-gray-400">Fetching filing document...</p>
            )}

            {documentError && (
              <p className="text-sm text-red-600">{documentError}</p>
            )}

            {filingText && selectedFiling && (
              <AnalysisResult
                filing={selectedFiling}
                filingText={filingText}
                privateCompany={privateCompany}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
