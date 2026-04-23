import { analyzeFilingText } from '@/lib/anthropic'

export const maxDuration = 120

export async function POST(request) {
  const { filingText, question } = await request.json()

  if (!filingText?.trim() || !question?.trim()) {
    return Response.json(
      { error: 'filingText and question are required' },
      { status: 400 }
    )
  }

  const answer = await analyzeFilingText(filingText, question)
  return Response.json({ answer })
}
