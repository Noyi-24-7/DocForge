# Getting Started with DocForge

Welcome! This guide will help you get DocForge up and running.

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

If you encounter network issues, try:
```bash
npm install --registry https://registry.npmjs.org/
```

Or use yarn:
```bash
yarn install
```

### 2. Set Up Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials (see below for where to get them).

### 3. Set Up Supabase

1. **Create a Supabase project** at https://supabase.com
2. **Run database migration**:
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run
3. **Create storage buckets** (see Storage Setup below)

### 4. Get Your API Keys

**Supabase Keys:**
- Go to Project Settings → API
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**OpenAI Key:**
- Go to https://platform.openai.com/api-keys
- Create new key → `OPENAI_API_KEY`

**GitHub Token (Optional):**
- Go to GitHub Settings → Developer settings → Personal access tokens
- Create token with `repo` scope → `GITHUB_TOKEN`

### 5. Verify Setup

```bash
npm run verify
```

This checks if everything is configured correctly.

### 6. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## 📋 Detailed Setup

### Supabase Database Setup

1. **Create Tables**: Run the migration SQL
2. **Verify Tables**: Check that `projects`, `documents`, and `generations` tables exist
3. **Check RLS**: Verify Row Level Security is enabled

### Supabase Storage Setup

Create these buckets in Supabase Dashboard → Storage:

| Bucket Name | Public | Size Limit | Purpose |
|------------|--------|------------|---------|
| `documents` | No | 50 MB | Generated PDFs and markdown |
| `assets` | Yes | 10 MB | Images and public assets |
| `repositories` | No | 100 MB | Uploaded repository archives |
| `temp` | No | 25 MB | Temporary processing files |

### Environment Variables Reference

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
GITHUB_TOKEN=ghp_...
```

## ✅ Testing Your Setup

1. **Sign Up**: Create a new account at http://localhost:3000
2. **Create Project**: 
   - Click "New Project"
   - Enter a name
   - Add a GitHub repo URL (e.g., `https://github.com/vercel/next.js`)
3. **Generate Documentation**:
   - Open your project
   - Click "Generate Docs"
   - Wait for AI to analyze and generate documentation
4. **Edit Documentation**:
   - Use the markdown editor to refine content
   - Click "Save" to persist changes
5. **Export PDF**:
   - Click "Export PDF" button
   - Download your documentation

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Setup
npm run setup        # Run setup script
npm run verify       # Verify setup configuration
```

## 📚 Documentation

- **[README.md](./README.md)** - Full project documentation
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide
- **[CHECKLIST.md](./CHECKLIST.md)** - Setup checklist

## 🐛 Troubleshooting

### Dependencies won't install
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment variables not working
- Make sure file is named `.env.local` (not `.env`)
- Restart development server after changing `.env.local`
- Check for typos in variable names

### Supabase connection errors
- Verify your Supabase project is active
- Check URL and keys are correct
- Ensure RLS policies are set up

### OpenAI API errors
- Verify API key is valid
- Check you have credits/quota
- Review rate limits

### GitHub API errors
- For private repos, add `GITHUB_TOKEN`
- Public repos work without token
- Check repository URL format

## 🎯 Next Steps

1. ✅ Complete setup checklist
2. ✅ Test with a sample repository
3. ✅ Customize documentation templates
4. ✅ Set up production deployment
5. ✅ Configure monitoring and logging

## 💡 Tips

- Start with a public GitHub repository for testing
- Use GPT-4o-mini for faster/cheaper generation during development
- Monitor OpenAI usage in the dashboard
- Set up Supabase backups for production

## 🆘 Need Help?

- Check the [README.md](./README.md) for detailed docs
- Review error messages in browser console
- Check Supabase logs in dashboard
- Verify all environment variables

Happy documenting! 🚀

