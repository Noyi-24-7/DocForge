import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GitHubService } from '@/lib/github/service'
import { analyzeRepository, generateFullDocumentation } from '@/lib/openai/service'
import { createDocument } from '@/app/actions/documents'
import { createServiceClient } from '@/lib/supabase/server'
import { APIError } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, repositoryUrl } = body

    if (!projectId || !repositoryUrl) {
      return NextResponse.json(
        { error: 'Missing projectId or repositoryUrl' },
        { status: 400 }
      )
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Parse GitHub URL
    const githubService = new GitHubService()
    const repoInfo = githubService.parseRepositoryUrl(repositoryUrl)

    if (!repoInfo) {
      return NextResponse.json({ error: 'Invalid repository URL' }, { status: 400 })
    }

    // Fetch repository data
    let repoInfoData, fileTree, keyFiles, dependencies, readme
    try {
      ;[repoInfoData, fileTree, keyFiles, dependencies, readme] = await Promise.all([
        githubService.getRepositoryInfo(repoInfo.owner, repoInfo.repo),
        githubService.getFileTree(repoInfo.owner, repoInfo.repo),
        githubService.getKeyFiles(repoInfo.owner, repoInfo.repo),
        githubService.getDependencies(repoInfo.owner, repoInfo.repo),
        githubService.getReadme(repoInfo.owner, repoInfo.repo),
      ])
    } catch (error) {
      console.error('GitHub fetch error:', error)
      const message =
        error instanceof APIError
          ? error.message
          : 'Failed to fetch repository information. Ensure the repository exists and is accessible.'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Analyze repository
    let analysis
    try {
      analysis = await analyzeRepository({
        name: repoInfoData.name,
        description: repoInfoData.description,
        language: repoInfoData.language,
        framework: null,
        fileTree,
        keyFiles,
        dependencies,
        readme,
      })
    } catch (error) {
      console.error('OpenAI analysis error:', error)
      const message =
        error instanceof Error
          ? `OpenAI analysis failed: ${error.message}`
          : 'OpenAI analysis failed. Check your OpenAI API key and quota.'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    // Generate documentation
    let documentation
    try {
      documentation = await generateFullDocumentation({
        name: project.name,
        description: project.description,
        analysis,
      })
    } catch (error) {
      console.error('OpenAI generation error:', error)
      const message =
        error instanceof Error
          ? `OpenAI generation failed: ${error.message}`
          : 'OpenAI generation failed. Check your OpenAI API key and quota.'
      return NextResponse.json({ error: message }, { status: 500 })
    }

    // Note: Generation tracking is handled within the OpenAI service
    // The actual token usage and costs are tracked during the generation process

    // Create documents
    const documents = await Promise.all(
      documentation.sections.map((section, index) =>
        createDocument(projectId, {
          title: section.heading,
          content: section.content,
          type: section.heading.toLowerCase() as any,
          orderIndex: index,
        })
      )
    )

    return NextResponse.json({ success: true, documents })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

