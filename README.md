# DocForge

AI-powered documentation generation platform that automatically creates comprehensive documentation websites and PDF manuals for software projects.

## Features

- 🔗 **Connect GitHub Repositories** - Link your GitHub repo or upload project files
- 🤖 **AI-Powered Generation** - Automatically generate documentation using GPT-4
- ✏️ **Markdown Editor** - Built-in editor with live preview
- 📄 **PDF Export** - Export documentation as professional PDF manuals
- 🔐 **Authentication** - Secure user authentication with Supabase
- 💾 **Cloud Storage** - Store and manage documentation with Supabase Storage

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: OpenAI GPT-4o / GPT-4o-mini
- **Storage**: Supabase Storage
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Getting Started

> **🚀 New to DocForge?** Start with [START_HERE.md](./START_HERE.md) for a guided setup experience!

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- (Optional) GitHub token for private repositories

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Verify setup
npm run verify

# Start development
npm run dev
```

For detailed instructions, see:
- **[START_HERE.md](./START_HERE.md)** - Your starting point
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Detailed setup guide
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick start
- **[SETUP.md](./SETUP.md)** - Advanced configuration

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DocForge
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# GitHub (optional)
GITHUB_TOKEN=your_github_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:

Run these SQL commands in your Supabase SQL editor:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  methodology TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generations table
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT,
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10, 6),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for documents and generations
CREATE POLICY "Users can manage own documents"
  ON documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own generations"
  ON generations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = generations.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_generations_project_id ON generations(project_id);
```

5. Set up Supabase Storage buckets:

In your Supabase dashboard, create these storage buckets:
- `documents` (private)
- `assets` (public)
- `repositories` (private)
- `temp` (private)

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── editor/            # Editor pages
├── components/            # React components
│   ├── auth/              # Auth components
│   ├── dashboard/        # Dashboard components
│   ├── editor/            # Editor components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
│   ├── openai/           # OpenAI integration
│   ├── supabase/         # Supabase client
│   ├── github/           # GitHub integration
│   └── storage/          # Storage service
├── schemas/              # Zod validation schemas
└── types/                # TypeScript types
```

## Usage

1. **Sign Up / Login**: Create an account or sign in
2. **Create Project**: Add a new project with repository URL
3. **Generate Documentation**: Click "Generate Docs" to analyze repository and create documentation
4. **Edit**: Use the markdown editor to refine documentation
5. **Export**: Download as PDF

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GITHUB_TOKEN` | GitHub personal access token | Optional |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## Deployment

### Pre-Deployment Checklist

Before deploying to production, ensure you have:

- ✅ Completed all setup steps in [GETTING_STARTED.md](./GETTING_STARTED.md)
- ✅ Verified all environment variables are documented
- ✅ Applied database migrations in Supabase
- ✅ Created all required Supabase storage buckets (`documents`, `assets`, `repositories`, `temp`)
- ✅ Tested the application locally with `npm run dev`
- ✅ Run pre-deployment checks with `npm run deploy:check`

Run the deployment check script:

```bash
npm run deploy:check
```

For a full check including build test:

```bash
npm run deploy:check:full
```

### Deploying to Vercel

#### Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project**: Ensure your Supabase project is set up and running
4. **OpenAI API Key**: Have your OpenAI API key ready

#### Step-by-Step Deployment

**1. Import Project to Vercel**

- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "Add New" → "Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js framework

**2. Configure Project Settings**

Vercel should automatically configure:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**3. Add Environment Variables**

In Vercel project settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |
| `OPENAI_API_KEY` | Your OpenAI API key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | Production only |
| `GITHUB_TOKEN` | GitHub personal access token | Optional, for private repos |

**Important**: 
- Copy values from your `.env.local` file
- For `NEXT_PUBLIC_APP_URL`, use your Vercel domain (e.g., `https://docforge.vercel.app`)
- Mark sensitive keys (service role, OpenAI) as "Sensitive" in Vercel

**4. Deploy**

- Click "Deploy"
- Wait for build to complete (2-5 minutes)
- Vercel will provide a deployment URL

**5. Verify Deployment**

After deployment:
- Visit your deployment URL
- Test authentication (sign up/login)
- Create a test project
- Generate documentation
- Export a PDF

### Post-Deployment Configuration

#### Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel deployment URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**` (for wildcard support)

#### Configure Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Update Supabase Auth redirect URLs

#### Enable Vercel Analytics (Recommended)

1. Go to Vercel project → Analytics
2. Enable Web Analytics
3. Monitor performance metrics

### Production Best Practices

#### Monitoring and Logging

- **Vercel Logs**: Monitor deployment and runtime logs in Vercel dashboard
- **Supabase Logs**: Check database queries and API usage in Supabase dashboard
- **OpenAI Usage**: Monitor token usage and costs at [platform.openai.com](https://platform.openai.com/usage)

#### Performance Optimization

- **Enable Edge Caching**: Vercel automatically caches static assets
- **Image Optimization**: Next.js Image component is already configured
- **Font Optimization**: Fonts are loaded via `next/font/google`

#### Security

- **Environment Variables**: Never commit `.env.local` to Git
- **API Keys**: Rotate keys periodically
- **Supabase RLS**: Ensure Row Level Security policies are enabled
- **HTTPS**: Vercel provides automatic HTTPS

#### Automatic Deployments

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

To disable automatic deployments:
1. Go to project Settings → Git
2. Configure deployment branches

#### Backup Strategy

- **Database**: Enable Supabase Point-in-Time Recovery (PITR) for paid plans
- **Storage**: Regularly backup Supabase storage buckets
- **Code**: Keep Git repository as source of truth

### Troubleshooting Deployment Issues

#### Build Failures

**Issue**: `npm install` fails
```bash
# Solution: Check package.json for dependency conflicts
npm install --legacy-peer-deps
```

**Issue**: TypeScript compilation errors
```bash
# Solution: Run type check locally
npm run type-check
```

**Issue**: Next.js build fails
```bash
# Solution: Test build locally
npm run build
```

#### Environment Variable Issues

**Issue**: "Missing environment variables" error

**Solution**: 
1. Verify all required variables are set in Vercel
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding variables

**Issue**: `NEXT_PUBLIC_APP_URL` not working

**Solution**:
1. Ensure it's set to your Vercel domain
2. Include `https://` protocol
3. No trailing slash

#### Supabase Connection Errors

**Issue**: "Failed to connect to Supabase"

**Solution**:
1. Verify Supabase project is active
2. Check URL and keys are correct
3. Ensure RLS policies allow access
4. Check Supabase service status

**Issue**: Authentication redirects failing

**Solution**:
1. Update Supabase Auth redirect URLs
2. Include `/auth/callback` route
3. Verify `NEXT_PUBLIC_APP_URL` matches domain

#### OpenAI API Issues

**Issue**: "Rate limit exceeded"

**Solution**:
1. Check OpenAI usage dashboard
2. Upgrade plan or add credits
3. Implement rate limiting in application

**Issue**: "Invalid API key"

**Solution**:
1. Verify key is correct in Vercel
2. Check key hasn't been revoked
3. Generate new key if needed

#### Runtime Errors

**Issue**: 500 Internal Server Error

**Solution**:
1. Check Vercel function logs
2. Verify all environment variables
3. Check Supabase connection
4. Review API route implementations

**Issue**: PDF export not working

**Solution**:
1. Check Vercel function timeout (default 10s, max 60s)
2. Verify Supabase storage bucket permissions
3. Check file size limits

#### Performance Issues

**Issue**: Slow page loads

**Solution**:
1. Enable Vercel Analytics to identify bottlenecks
2. Check OpenAI API response times
3. Optimize database queries
4. Review Supabase connection pooling

**Issue**: Function timeout

**Solution**:
1. Increase timeout in `vercel.json` (max 60s for Pro)
2. Optimize long-running operations
3. Consider background jobs for heavy tasks

### Deployment Commands Reference

```bash
# Pre-deployment checks
npm run deploy:check          # Quick validation
npm run deploy:check:full     # Full validation with build test

# Local production build
npm run build:production      # Build with pre-checks
npm run build                 # Standard build
npm run start                 # Start production server locally

# Development
npm run dev                   # Start development server
npm run type-check            # TypeScript validation
npm run lint                  # ESLint validation
```

### Environment Variables in Production

All environment variables must be set in Vercel dashboard:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for documentation generation |
| `NEXT_PUBLIC_APP_URL` | Yes | Your production URL (e.g., https://docforge.vercel.app) |
| `GITHUB_TOKEN` | No | GitHub PAT for private repository access |

### Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

