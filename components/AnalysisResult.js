'use client'

import { useState } from 'react'

export default function AnalysisResult({ filingText, filing }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setAnswer(null)
    setError(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filingText, question }),
      })

      if (!res.ok) throw new Error('Analysis failed')

      const data = await res.json()
      setAnswer(data.answer)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="mb-1 text-lg font-semibold text-gray-900">
        Ask a question
      </h2>
      <p className="mb-4 text-sm text-gray-500">
        {filing.formType} &mdash; {filing.date}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What were the total revenues? What are the main risk factors?"
          rows={3}
          disabled={loading}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none resize-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="self-end rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {loading && (
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 px-5 py-6 text-center">
          <p className="font-medium text-gray-600">Analyzing filing...</p>
          <p className="mt-1 text-sm text-gray-400">
            This may take 15–30 seconds for large filings.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {answer && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white px-6 py-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600">
            Analysis
          </p>
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}
