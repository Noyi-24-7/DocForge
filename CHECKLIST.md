# DocForge Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Initial Setup

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created from `.env.example`

## Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `NEXT_PUBLIC_APP_URL` - Application URL (http://localhost:3000 for dev)
- [ ] `GITHUB_TOKEN` - (Optional) GitHub personal access token

## Supabase Database

- [ ] Supabase project created
- [ ] Database migration run (`supabase/migrations/001_initial_schema.sql`)
- [ ] Tables created: `projects`, `documents`, `generations`
- [ ] Row Level Security (RLS) enabled
- [ ] RLS policies created for all tables
- [ ] Indexes created for performance

## Supabase Storage

- [ ] `documents` bucket created (private, 50MB limit)
- [ ] `assets` bucket created (public, 10MB limit)
- [ ] `repositories` bucket created (private, 100MB limit)
- [ ] `temp` bucket created (private, 25MB limit)

## Verification

- [ ] Run `npm run verify` - all checks pass
- [ ] Development server starts (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can sign up / sign in
- [ ] Can create a project
- [ ] Can generate documentation (with valid GitHub repo)
- [ ] Can edit documents in editor
- [ ] Can export PDF

## Testing

- [ ] Test with a public GitHub repository
- [ ] Test documentation generation
- [ ] Test markdown editor
- [ ] Test PDF export
- [ ] Test authentication flow
- [ ] Test project CRUD operations

## Production Deployment (if applicable)

- [ ] Environment variables set in deployment platform
- [ ] Supabase production project configured
- [ ] Database migrations run in production
- [ ] Storage buckets created in production
- [ ] Domain configured
- [ ] SSL certificate set up
- [ ] Monitoring/logging configured

## Quick Verification Commands

```bash
# Check Node.js version
node -v

# Check npm version
npm -v

# Install dependencies
npm install

# Verify setup
npm run verify

# Start development server
npm run dev

# Type check
npm run type-check

# Lint code
npm run lint
```

## Common Issues

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

### "Environment variable not found"
- Check `.env.local` exists
- Verify variable names match exactly (case-sensitive)
- Restart development server after changing `.env.local`

### "Supabase connection error"
- Verify URL and keys are correct
- Check Supabase project is active
- Verify network connection

### "OpenAI API error"
- Check API key is valid
- Verify you have credits/quota
- Check rate limits

### "Storage bucket not found"
- Create buckets in Supabase Dashboard
- Verify bucket names match exactly
- Check bucket permissions

## Support Resources

- [README.md](./README.md) - Full documentation
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- OpenAI Docs: https://platform.openai.com/docs

