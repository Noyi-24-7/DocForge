# DocForge Quick Start Guide

Get DocForge up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)
- OpenAI API key

## Step 1: Install Dependencies

```bash
npm install
```

Or use the setup script:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Step 2: Configure Environment

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your credentials:

```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Your app URL (use http://localhost:3000 for local dev)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: For private GitHub repos
GITHUB_TOKEN=ghp_...
```

## Step 3: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to execute the migration

This creates:
- `projects` table
- `documents` table
- `generations` table
- Row Level Security policies
- Indexes for performance

## Step 4: Create Storage Buckets

In Supabase Dashboard → **Storage**:

1. Click **New bucket**
2. Create these buckets:

   **documents** (Private)
   - Name: `documents`
   - Public: No
   - File size limit: 50 MB

   **assets** (Public)
   - Name: `assets`
   - Public: Yes
   - File size limit: 10 MB

   **repositories** (Private)
   - Name: `repositories`
   - Public: No
   - File size limit: 100 MB

   **temp** (Private)
   - Name: `temp`
   - Public: No
   - File size limit: 25 MB

## Step 5: Verify Setup

Run the verification script:

```bash
node scripts/verify-setup.js
```

This checks:
- ✅ Environment variables are set
- ✅ Required files exist
- ✅ Dependencies are installed

## Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Application

1. **Sign Up**: Create a new account
2. **Create Project**: Add a new project with a GitHub repo URL
   - Example: `https://github.com/vercel/next.js`
3. **Generate Docs**: Click "Generate Docs" button
4. **Edit**: Use the markdown editor to refine documentation
5. **Export**: Download as PDF

## Troubleshooting

### "Unauthorized" errors
- Check that your Supabase keys are correct
- Verify RLS policies are set up correctly

### "OpenAI API error"
- Verify your OpenAI API key is valid
- Check you have credits in your OpenAI account

### "GitHub API error"
- For private repos, add `GITHUB_TOKEN` to `.env.local`
- Public repos work without a token

### Database connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check that migrations ran successfully

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [SETUP.md](./SETUP.md) for advanced configuration
- Review the code structure in `src/` directory

## Need Help?

- Check the [README.md](./README.md) for detailed docs
- Review error messages in the browser console
- Check Supabase logs in the dashboard
- Verify all environment variables are set correctly

Happy documenting! 🚀

