# 🚀 DocForge - Start Here

Welcome to DocForge! This is your starting point.

## ⚡ Quick Start (Choose One)

### Option 1: Automated Setup (Recommended)
```bash
npm run setup
```
This will install dependencies and guide you through setup.

### Option 2: Manual Setup
Follow the [GETTING_STARTED.md](./GETTING_STARTED.md) guide step by step.

## 📋 What You Need

Before starting, make sure you have:

- ✅ **Node.js 18+** installed
- ✅ **Supabase account** (free tier works)
- ✅ **OpenAI API key** (get from https://platform.openai.com)
- ✅ **GitHub account** (optional, for private repos)

## 🎯 Setup Steps Summary

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Add your API keys (see [GETTING_STARTED.md](./GETTING_STARTED.md))

3. **Set Up Supabase**
   - Create project at https://supabase.com
   - Run SQL migration from `supabase/migrations/001_initial_schema.sql`
   - Create 4 storage buckets (see [SETUP.md](./SETUP.md))

4. **Verify Setup**
   ```bash
   npm run verify
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

## 📚 Documentation Guide

- **New to DocForge?** → Start with [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Quick setup?** → Use [QUICKSTART.md](./QUICKSTART.md)
- **Detailed setup?** → Read [SETUP.md](./SETUP.md)
- **Full documentation?** → See [README.md](./README.md)
- **Checklist?** → Use [CHECKLIST.md](./CHECKLIST.md)

## 🛠️ Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run type-check   # Check TypeScript types
npm run setup        # Run automated setup
npm run verify       # Verify configuration
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Dependencies installed (`node_modules` exists)
- [ ] `.env.local` file created with all keys
- [ ] Supabase database tables created
- [ ] Storage buckets created
- [ ] `npm run verify` passes all checks
- [ ] Development server starts (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can sign up and create a project

## 🐛 Common Issues

### npm install fails
- Check internet connection
- Try: `npm install --registry https://registry.npmjs.org/`
- Or use: `yarn install`

### Environment variables not working
- File must be named `.env.local` (not `.env`)
- Restart dev server after changes
- Check for typos in variable names

### Supabase connection errors
- Verify project URL and keys
- Check project is active
- Ensure migrations ran successfully

## 🎓 Learning Path

1. **Day 1**: Complete setup and test with a sample repo
2. **Day 2**: Explore the editor and customization
3. **Day 3**: Set up production deployment
4. **Day 4**: Customize prompts and templates
5. **Day 5**: Optimize for your use case

## 🆘 Need Help?

1. Check the relevant documentation file
2. Run `npm run verify` to check configuration
3. Review error messages in browser console
4. Check Supabase dashboard logs
5. Verify all environment variables

## 🎉 Ready to Start?

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Verify setup
npm run verify

# 4. Start developing
npm run dev
```

Then open http://localhost:3000 and start documenting! 🚀

---

**Next Step**: Open [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed instructions.

