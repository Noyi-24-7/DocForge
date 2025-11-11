import { APIError } from '../errors'

export interface GitHubFile {
  path: string
  content: string
  type: string
}

export interface RepositoryInfo {
  name: string
  description: string | null
  language: string | null
  defaultBranch: string
}

export class GitHubService {
  private async fetchWithAuth(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        }),
      },
    })

    if (!response.ok) {
      throw new APIError(
        `GitHub API error: ${response.statusText}`,
        response.status,
        'GITHUB_API_ERROR'
      )
    }

    return response
  }

  async getRepositoryInfo(owner: string, repo: string): Promise<RepositoryInfo> {
    const response = await this.fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}`
    )
    const data = await response.json()

    return {
      name: data.name,
      description: data.description,
      language: data.language,
      defaultBranch: data.default_branch || 'main',
    }
  }

  async getFileTree(owner: string, repo: string, branch: string = 'main'): Promise<string> {
    const response = await this.fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    )
    const data = await response.json()

    if (!data.tree) {
      return ''
    }

    const files = data.tree
      .filter((item: any) => item.type === 'blob')
      .map((item: any) => item.path)
      .sort()

    return files.join('\n')
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main'
  ): Promise<string> {
    const response = await this.fetchWithAuth(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    )
    const data = await response.json()

    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }

    return data.content || ''
  }

  async getKeyFiles(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<Array<{ path: string; language: string; content: string }>> {
    const keyPaths = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'requirements.txt',
      'Pipfile',
      'go.mod',
      'Cargo.toml',
      'pom.xml',
      'build.gradle',
      'tsconfig.json',
      'next.config.js',
      'docker-compose.yml',
      'Dockerfile',
      '.env.example',
      'README.md',
    ]

    const files: Array<{ path: string; language: string; content: string }> = []

    for (const path of keyPaths) {
      try {
        const content = await this.getFileContent(owner, repo, path, branch)
        const language = this.detectLanguage(path)
        files.push({ path, language, content })
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    return files
  }

  async getDependencies(owner: string, repo: string, branch: string = 'main'): Promise<Record<string, string>> {
    const dependencies: Record<string, string> = {}

    try {
      const packageJson = await this.getFileContent(owner, repo, 'package.json', branch)
      const parsed = JSON.parse(packageJson)
      Object.assign(dependencies, parsed.dependencies || {}, parsed.devDependencies || {})
    } catch {
      // No package.json
    }

    try {
      const requirements = await this.getFileContent(owner, repo, 'requirements.txt', branch)
      requirements.split('\n').forEach(line => {
        const match = line.match(/^([^=<>]+)/)
        if (match) {
          dependencies[match[1].trim()] = line.trim()
        }
      })
    } catch {
      // No requirements.txt
    }

    return dependencies
  }

  async getReadme(owner: string, repo: string, branch: string = 'main'): Promise<string | null> {
    const readmePaths = ['README.md', 'README.txt', 'readme.md', 'Readme.md']

    for (const path of readmePaths) {
      try {
        return await this.getFileContent(owner, repo, path, branch)
      } catch {
        // Try next path
      }
    }

    return null
  }

  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      go: 'go',
      rs: 'rust',
      java: 'java',
      json: 'json',
      yml: 'yaml',
      yaml: 'yaml',
      md: 'markdown',
      toml: 'toml',
    }
    return langMap[ext || ''] || 'text'
  }

  parseRepositoryUrl(url: string): { owner: string; repo: string } | null {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
      }
    }

    return null
  }
}

