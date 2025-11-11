# DocForge Setup Scripts

This directory contains helper scripts for setting up and verifying DocForge.

## Available Scripts

### `setup.sh`

Automated setup script that:
- Checks Node.js and npm versions
- Installs dependencies
- Creates `.env.local` from template
- Provides next steps

**Usage:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Or via npm:
```bash
npm run setup
```

### `verify-setup.js`

Verification script that checks:
- Environment variables are set
- Required files exist
- Dependencies are installed

**Usage:**
```bash
node scripts/verify-setup.js
```

Or via npm:
```bash
npm run verify
```

## Manual Setup

If scripts don't work, follow the manual setup:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local`** with your API keys

4. **Set up Supabase:**
   - Run SQL migrations
   - Create storage buckets

5. **Start development:**
   ```bash
   npm run dev
   ```

## Troubleshooting Scripts

### Permission Denied
```bash
chmod +x scripts/setup.sh
```

### Node.js Version
Scripts require Node.js 18+. Check with:
```bash
node -v
```

### Script Errors
- Check Node.js and npm are installed
- Verify you're in the project root directory
- Review error messages for specific issues

