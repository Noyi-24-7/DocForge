'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProject } from '@/app/actions/projects'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectInput } from '@/schemas/project.schema'

export function NewProjectForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
  })

  async function onSubmit(data: ProjectInput) {
    setIsLoading(true)
    setError(null)

    try {
      const project = await createProject(data)
      router.push(`/editor/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 paragraph-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="label-sm text-foreground">
          Project Name *
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="My Awesome Project"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="paragraph-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="label-sm text-foreground">
          Description
        </label>
        <Input
          id="description"
          {...register('description')}
          placeholder="A brief description of your project"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="paragraph-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="repositoryUrl" className="label-sm text-foreground">
          GitHub Repository URL
        </label>
        <Input
          id="repositoryUrl"
          type="url"
          {...register('repositoryUrl')}
          placeholder="https://github.com/username/repo"
          disabled={isLoading}
        />
        {errors.repositoryUrl && (
          <p className="paragraph-sm text-destructive">{errors.repositoryUrl.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Project'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

