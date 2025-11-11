import OpenAI from 'openai'
import { AIServiceError } from '../errors'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function callWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error

      if (error instanceof OpenAI.RateLimitError) {
        const delay = baseDelay * Math.pow(2, i)
        console.log(`Rate limited. Retry ${i + 1}/${maxRetries} in ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      if (error instanceof OpenAI.APIConnectionError) {
        console.log(`Connection error. Attempt ${i + 1}/${maxRetries}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }

      if (error instanceof OpenAI.BadRequestError) {
        throw new AIServiceError(
          `Invalid request: ${error.message}`,
          'INVALID_REQUEST',
          false
        )
      }

      throw error
    }
  }

  throw new AIServiceError(
    `Operation failed after ${maxRetries} retries: ${lastError!.message}`,
    'MAX_RETRIES_EXCEEDED',
    false
  )
}

