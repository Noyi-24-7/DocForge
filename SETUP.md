# DocForge Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and OpenAI credentials

3. **Set Up Database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

4. **Set Up Storage Buckets**
   - In Supabase Dashboard → Storage
   - Create these buckets:
     - `documents` (private)
     - `assets` (public)
     - `repositories` (private)
     - `temp` (private)

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Database Setup

The migration file includes:
- Tables: `projects`, `documents`, `generations`
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamp updates

## Storage Setup

Create the following buckets in Supabase Storage:

1. **documents** (Private)
   - For storing generated PDFs and markdown files
   - File size limit: 50MB

2. **assets** (Public)
   - For storing images and public assets
   - File size limit: 10MB

3. **repositories** (Private)
   - For storing uploaded repository archives
   - File size limit: 100MB

4. **temp** (Private)
   - For temporary files during processing
   - File size limit: 25MB

## API Keys

### OpenAI
- Get your API key from https://platform.openai.com/api-keys
- Add to `.env.local` as `OPENAI_API_KEY`

### GitHub (Optional)
- For private repositories, create a personal access token
- Add to `.env.local` as `GITHUB_TOKEN`
- Public repositories work without a token

## Testing

1. Sign up for an account
2. Create a new project
3. Add a GitHub repository URL (e.g., `https://github.com/vercel/next.js`)
4. Click "Generate Docs" to create documentation
5. Edit the generated documentation
6. Export as PDF

## Production Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Environment Variables for Production

Make sure to set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Notes

- PDF generation is currently simplified. For production, consider using `@react-pdf/renderer` or `puppeteer` for proper PDF rendering.
- The OpenAI service includes retry logic and cost tracking.
- All database operations use Row Level Security for data isolation.

