'use client'

export default function CompanyResults({ companies, selectedCik, onSelect }) {
  if (companies.length === 0) {
    return (
      <p className="mt-6 text-center text-gray-400">No companies found.</p>
    )
  }

  return (
    <ul className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
      {companies.map((company) => {
        const isSelected = selectedCik === company.cik
        return (
          <li key={`${company.cik}-${company.ticker}`}>
            <button
              onClick={() => onSelect(company)}
              className={`w-full px-5 py-4 text-left transition-colors hover:bg-red-50 focus:outline-none ${
                isSelected ? 'bg-red-50 border-l-4 border-red-600' : 'border-l-4 border-transparent'
              }`}
            >
              <span className="block font-medium text-gray-900">
                {company.name}
              </span>
              <span className="mt-0.5 block text-sm text-gray-500">
                {company.ticker} &middot; CIK {company.cik}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
