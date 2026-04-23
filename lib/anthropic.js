import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

const model = new ChatAnthropic({
  model: 'claude-sonnet-4-6',
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM =
  "You are a senior financial analyst specializing in SEC filings. You will be given the full text of an SEC filing and a question. Provide a clear and comprehensive answer structured as: 1) A direct answer to the question 2) Supporting evidence with specific data points, quotes, or references from the filing 3) Any important context or caveats. Be factual and cite specific figures and sections when possible."

// Gemini 1.5 Flash has a 1M token context window (~750K words).
// We truncate at 900K chars as a safety margin for very large filings.
const MAX_CHARS = 900_000

export async function analyzeFilingText(filingText, question) {
  return `1) Direct Answer\nThis is a static test response for the question: "${question}"\n\n2) Supporting Evidence\n- Revenue: $383.9 billion (up 8% YoY)\n- Net income: $97.0 billion (up 11% YoY)\n- Earnings per share: $6.13 diluted\n\n3) Context & Caveats\nThis is placeholder text for UI testing. Real analysis will call the Claude API once the key is configured.`
}
