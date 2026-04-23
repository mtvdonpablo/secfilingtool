import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const model = new ChatAnthropic({
  model: 'claude-haiku-4-5-20251001',
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM =
  "You are a senior financial analyst specializing in SEC filings. You will be given the full text of an SEC filing and a question. Provide a clear and comprehensive answer structured as: 1) A direct answer to the question 2) Supporting evidence with specific data points, quotes, or references from the filing 3) Any important context or caveats. Be factual and cite specific figures and sections when possible."

const MAX_CHARS = 900_000

export async function analyzeFilingText(filingText, question) {
  const text = filingText.length > MAX_CHARS
    ? filingText.slice(0, MAX_CHARS)
    : filingText

  const response = await model.invoke([
    new SystemMessage(SYSTEM),
    new HumanMessage(`Question: ${question}\n\nFiling:\n${text}`),
  ])

  return String(response.content)
}
