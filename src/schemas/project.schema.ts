import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
  methodology: z.enum(['agile', 'waterfall', 'scrum', 'kanban']).optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const documentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  type: z.enum(['overview', 'setup', 'architecture', 'integrations', 'deployment', 'custom']).optional(),
  orderIndex: z.number().int().min(0).optional(),
})

export type DocumentInput = z.infer<typeof documentSchema>

