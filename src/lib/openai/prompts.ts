export const SYSTEM_PROMPTS = {
  analyzeRepository: `You are an expert technical writer analyzing software repositories.
Your task is to understand the project structure, identify key components,
and extract relevant technical details for documentation.
Focus on: architecture, dependencies, setup requirements, and core functionality.
Output Format: JSON structure with sections for architecture, dependencies, setup, and notes.
Be thorough but concise. Focus on information relevant for documentation.`,

  generateSetupGuide: `You are creating clear, step-by-step setup instructions.
Write for developers with varying skill levels. Include prerequisites,
installation steps, configuration details, and troubleshooting tips.
Format output as structured markdown.`,

  createIntegrationDocs: `You are documenting API integrations and third-party services.
Explain authentication, endpoints, request/response formats, error handling,
and provide code examples. Be thorough but concise.`,

  buildInstructions: `You are creating build and deployment instructions.
Cover environment setup, build commands, testing procedures, and deployment steps.
Include common issues and their solutions.`,

  generateOverview: `You are creating a project overview section.
Provide a high-level description of the project, its purpose, key features,
and technology stack. Write in a clear, engaging manner for developers.
Format output as structured markdown.`,

  generateArchitecture: `You are documenting the architecture of a software project.
Explain the system design, key components, data flow, and architectural patterns.
Include diagrams descriptions and code structure explanations.
Format output as structured markdown.`,
}

export function buildAnalysisPrompt(repoData: {
  name: string
  description: string | null
  language: string | null
  framework: string | null
  fileTree: string
  keyFiles: Array<{ path: string; language: string; content: string }>
  dependencies: Record<string, string>
  readme: string | null
}): string {
  return `
Analyze the following repository for documentation generation:

## Repository Information
- Name: ${repoData.name}
- Language: ${repoData.language || 'Unknown'}
- Framework: ${repoData.framework || 'Unknown'}
- Description: ${repoData.description || 'No description'}

## File Structure
\`\`\`
${repoData.fileTree}
\`\`\`

## Key Files Content
${repoData.keyFiles.map(f => `
### ${f.path}
\`\`\`${f.language}
${f.content.substring(0, 2000)}
\`\`\`
`).join('\n')}

## Dependencies
${JSON.stringify(repoData.dependencies, null, 2)}

## README
${repoData.readme || 'No README found'}

## Task
Extract the following information:
1. Project architecture and design patterns
2. Setup requirements and prerequisites
3. Key integrations and their purposes
4. Build and deployment process
5. Notable configuration requirements

Output as structured JSON following this schema:
{
  "architecture": { "pattern": string, "layers": string[] },
  "setup": { "prerequisites": string[], "steps": string[] },
  "integrations": Array<{ "name": string, "purpose": string, "setupRequired": boolean }>,
  "buildProcess": { "commands": string[], "outputs": string[] },
  "configuration": Array<{ "file": string, "purpose": string, "required": boolean }>
}
`.trim()
}

