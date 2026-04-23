import { getFilings, getFilingDocument } from '@/lib/edgar'

export async function POST(request) {
  const body = await request.json()

  if (body.mode === 'document') {
    const { cik, accessionNumber, primaryDocument } = body
    if (!cik || !accessionNumber || !primaryDocument) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const text = await getFilingDocument(cik, accessionNumber, primaryDocument)
    return Response.json({ text })
  }

  // Default mode: list
  const { cik, formType } = body
  if (!cik || !formType) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const filings = await getFilings(cik, formType)
  return Response.json(filings)
}
