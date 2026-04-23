import { searchCompany } from '@/lib/edgar'

export async function POST(request) {
  const { companyName } = await request.json()

  if (!companyName?.trim()) {
    return Response.json({ error: 'companyName is required' }, { status: 400 })
  }

  const results = await searchCompany(companyName.trim())
  return Response.json(results)
}
