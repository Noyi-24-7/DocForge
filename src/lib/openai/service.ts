import { openai, callWithRetry } from './client'
import { SYSTEM_PROMPTS, buildAnalysisPrompt } from './prompts'
import { AIServiceError } from '../errors'
import type { RepositoryData, DocumentationContent } from '@/types'

export async function analyzeRepository(
  repoData: RepositoryData
): Promise<{
  architecture: { pattern: string; layers: string[] }
  setup: { prerequisites: string[]; steps: string[] }
  integrations: Array<{ name: string; purpose: string; setupRequired: boolean }>
  buildProcess: { commands: string[]; outputs: string[] }
  configuration: Array<{ file: string; purpose: string; required: boolean }>
}> {
  const prompt = buildAnalysisPrompt(repoData)

  const completion = await callWithRetry(() =>
    openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.analyzeRepository },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })
  )

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new AIServiceError('No response from OpenAI', 'NO_RESPONSE', false)
  }

  try {
    return JSON.parse(content)
  } catch (error) {
    throw new AIServiceError(
      'Failed to parse AI response',
      'PARSE_ERROR',
      false
    )
  }
}

export async function generateDocumentationSection(
  sectionType: 'overview' | 'setup' | 'architecture' | 'integrations' | 'deployment',
  projectData: {
    name: string
    description: string | null
    analysis: Awaited<ReturnType<typeof analyzeRepository>>
  }
): Promise<string> {
  const systemPrompt = {
    overview: SYSTEM_PROMPTS.generateOverview,
    setup: SYSTEM_PROMPTS.generateSetupGuide,
    architecture: SYSTEM_PROMPTS.generateArchitecture,
    integrations: SYSTEM_PROMPTS.createIntegrationDocs,
    deployment: SYSTEM_PROMPTS.buildInstructions,
  }[sectionType]

  const userPrompt = `
Generate ${sectionType} documentation for the project "${projectData.name}".

${projectData.description ? `Description: ${projectData.description}` : ''}

## Analysis Results
${JSON.stringify(projectData.analysis, null, 2)}

Create comprehensive ${sectionType} documentation in markdown format.
Include code examples, step-by-step instructions, and troubleshooting tips where relevant.
`.trim()

  const completion = await callWithRetry(() =>
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })
  )

  return completion.choices[0]?.message?.content || ''
}

export async function generateFullDocumentation(
  projectData: {
    name: string
    description: string | null
    analysis: Awaited<ReturnType<typeof analyzeRepository>>
  }
): Promise<DocumentationContent> {
  const sections = ['overview', 'setup', 'architecture', 'integrations', 'deployment'] as const

  const generatedSections = await Promise.all(
    sections.map(async (sectionType, index) => {
      const content = await generateDocumentationSection(sectionType, projectData)
      return {
        heading: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
        content,
        order: index,
      }
    })
  )

  return {
    title: `${projectData.name} Documentation`,
    description: projectData.description || `Complete documentation for ${projectData.name}`,
    sections: generatedSections,
    metadata: {
      difficulty: 'intermediate',
      estimatedTime: '30 minutes',
      prerequisites: projectData.analysis.setup.prerequisites,
    },
  }
}

export function calculateCost(
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
  model: string = 'gpt-4o'
): number {
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4o': { prompt: 0.005, completion: 0.015 },
    'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
  }

  const rates = pricing[model] || pricing['gpt-4o']
  const cost =
    (usage.prompt_tokens * rates.prompt) / 1000 +
    (usage.completion_tokens * rates.completion) / 1000

  return cost
}

