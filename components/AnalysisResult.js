'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PRESETS = [
  {
    label: 'Risk Factors',
    prompt: (pc) =>
      `What are the key regulatory, legal, and operational risks disclosed in this annual filing that could affect a similar company${pc ? ` like ${pc}` : ''}? Be specific about which risks are most material.`,
  },
  {
    label: 'Business Model',
    prompt: (pc) =>
      `Analyze the business model, revenue streams, margins, and unit economics disclosed in this annual report. What are the key financial dynamics${pc ? ` that would apply to a similar private company like ${pc}` : ''}?`,
  },
  {
    label: 'Competitive Landscape',
    prompt: (pc) =>
      `What competitive threats, market positioning challenges, and industry dynamics does this company describe${pc ? ` that are relevant for evaluating ${pc}` : ''}? What should a similar company watch out for?`,
  },
  {
    label: 'Scale Challenges',
    prompt: (pc) =>
      `What operational, infrastructure, or organizational challenges emerged as this company scaled, based on the annual report? What should${pc ? ` ${pc}` : ' a similar private company'} anticipate as it grows?`,
  },
]

export default function AnalysisResult({ filingText, filing, privateCompany }) {
  const presets = PRESETS
  const [question, setQuestion] = useState('')
  const [activePreset, setActivePreset] = useState(null)
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handlePreset(preset) {
    setActivePreset(preset.label)
    setQuestion(preset.prompt(privateCompany))
  }

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
    <div>
      {privateCompany && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Evaluating</p>
          <p className="mt-0.5 font-semibold text-gray-900">{privateCompany}</p>
          <p className="mt-1 text-xs text-gray-500">
            Analysis will read the selected public filing and surface risks and insights relevant to {privateCompany}.
          </p>
        </div>
      )}

      <p className="mb-3 text-sm font-medium text-gray-700">Quick analysis</p>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            disabled={loading}
            className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-50 ${
              activePreset === preset.label
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value)
            setActivePreset(null)
          }}
          placeholder="Or ask your own question about this filing..."
          rows={4}
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

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {answer && (
        <div className="mt-6">
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Analysis</p>
          </div>

          <div
            id="analysis-content"
            className="rounded-lg border border-gray-200 bg-white px-8 py-6"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold text-gray-900 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 mt-6 text-xl font-bold text-gray-900 border-b border-gray-100 pb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold text-gray-800">{children}</h3>,
                p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-gray-700">{children}</p>,
                ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm leading-relaxed text-gray-700">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                hr: () => <hr className="my-4 border-gray-100" />,
                table: ({ children }) => (
                  <div className="mb-4 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                th: ({ children }) => <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</th>,
                td: ({ children }) => <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700">{children}</td>,
                blockquote: ({ children }) => <blockquote className="mb-3 border-l-4 border-red-200 pl-4 italic text-gray-600">{children}</blockquote>,
              }}
            >
              {answer}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
