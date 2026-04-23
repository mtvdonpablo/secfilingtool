const USER_AGENT = 'SECAnalyzer donjoseph28@gmail.com'

export async function searchCompany(companyName) {
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) throw new Error(`SEC API error: ${res.status}`)

  const data = await res.json()
  const search = companyName.toLowerCase()

  return Object.values(data)
    .filter((c) => c.title.toLowerCase().includes(search))
    .slice(0, 10)
    .map((c) => ({
      name: c.title,
      ticker: c.ticker,
      cik: String(c.cik_str).padStart(10, '0'),
    }))
}

export async function getFilings(cik, formType) {
  const res = await fetch(`https://data.sec.gov/submissions/CIK${cik}.json`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) throw new Error(`SEC API error: ${res.status}`)

  const data = await res.json()
  const { form, filingDate, accessionNumber, primaryDocument } =
    data.filings.recent

  const matches = []
  for (let i = 0; i < form.length && matches.length < 5; i++) {
    if (form[i] === formType) {
      matches.push({
        date: filingDate[i],
        accessionNumber: accessionNumber[i],
        primaryDocument: primaryDocument[i],
      })
    }
  }

  return matches
}

export async function getFilingDocument(cik, accessionNumber, primaryDocument) {
  const cikNum = parseInt(cik, 10)
  const accNoClean = accessionNumber.replace(/-/g, '')
  const url = `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accNoClean}/${primaryDocument}`

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) throw new Error(`Failed to fetch filing: ${res.status}`)

  const html = await res.text()
  return stripHtml(html)
}

function stripHtml(html) {
  return html
    .replace(/<(script|style|ix:[a-z]+)[^>]*>[\s\S]*?<\/\1>/gi, ' ') // remove script/style/ix blocks with content
    .replace(/<[^>]+>/g, ' ')       // remove all remaining tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ')        // remove numeric HTML entities
    .replace(/[ \t]+/g, ' ')        // collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')     // collapse excess blank lines
    .trim()
}
