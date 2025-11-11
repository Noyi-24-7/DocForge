export interface Project {
  id: string
  userId: string
  name: string
  description: string | null
  repositoryUrl: string | null
  methodology: string | null
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  projectId: string
  title: string
  content: string | null
  type: 'overview' | 'setup' | 'architecture' | 'integrations' | 'deployment' | 'custom' | null
  orderIndex: number | null
  createdAt: string
  updatedAt: string
}

export interface Generation {
  id: string
  projectId: string
  prompt: string
  response: string | null
  model: string | null
  tokensUsed: number | null
  cost: number | null
  status: 'pending' | 'completed' | 'failed' | null
  createdAt: string
}

export interface RepositoryData {
  name: string
  description: string | null
  language: string | null
  framework: string | null
  fileTree: string
  keyFiles: Array<{
    path: string
    language: string
    content: string
  }>
  dependencies: Record<string, string>
  readme: string | null
}

export interface DocumentationContent {
  title: string
  description: string
  sections: Array<{
    heading: string
    content: string
    order: number
  }>
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: string
    prerequisites: string[]
  }
}

export interface ProjectInput {
  name: string
  description?: string
  repositoryUrl?: string
  methodology?: string
}

export interface DocumentInput {
  title: string
  content?: string
  type?: Document['type']
  orderIndex?: number
}

