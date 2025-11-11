#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
}

let hasErrors = false

// Check Node version
function checkNodeVersion() {
  log.info('Checking Node.js version...')
  const nodeVersion = process.version
  const major = parseInt(nodeVersion.split('.')[0].substring(1))
  
  if (major < 18) {
    log.error(`Node.js ${major} detected. Version 18 or higher is required.`)
    hasErrors = true
  } else {
    log.success(`Node.js ${nodeVersion} (compatible)`)
  }
}

// Check if dependencies are installed
function checkDependencies() {
  log.info('Checking dependencies...')
  
  if (!fs.existsSync('node_modules')) {
    log.error('node_modules not found. Run: npm install')
    hasErrors = true
    return
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const requiredDeps = [
    'next',
    'react',
    '@supabase/supabase-js',
    'openai',
    'zod',
  ]
  
  const missingDeps = requiredDeps.filter(
    (dep) => !packageJson.dependencies[dep]
  )
  
  if (missingDeps.length > 0) {
    log.error(`Missing dependencies: ${missingDeps.join(', ')}`)
    hasErrors = true
  } else {
    log.success('All required dependencies are installed')
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  log.info('Checking environment variables...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]
  
  const optionalVars = ['GITHUB_TOKEN']
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    log.warn('.env.local file not found (okay for production deployment)')
  }
  
  // Check each required variable
  const missingVars = requiredVars.filter((varName) => !process.env[varName])
  
  if (missingVars.length > 0) {
    log.error(`Missing required environment variables: ${missingVars.join(', ')}`)
    log.info('These must be set in Vercel dashboard during deployment')
    hasErrors = true
  } else {
    log.success('All required environment variables are documented')
  }
  
  // Check optional variables
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      log.warn(`Optional variable ${varName} not set (needed for private repos)`)
    }
  })
}

// Check TypeScript compilation
function checkTypeScript() {
  log.info('Checking TypeScript compilation...')
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' })
    log.success('TypeScript compilation successful')
  } catch (error) {
    log.error('TypeScript compilation failed')
    log.error(error.stdout?.toString() || error.message)
    hasErrors = true
  }
}

// Check linting
function checkLinting() {
  log.info('Running ESLint...')
  
  try {
    execSync('npm run lint', { stdio: 'pipe' })
    log.success('No linting errors')
  } catch (error) {
    log.error('Linting failed')
    log.error(error.stdout?.toString() || error.message)
    hasErrors = true
  }
}

// Check Next.js configuration
function checkNextConfig() {
  log.info('Checking Next.js configuration...')
  
  const configPath = path.join(process.cwd(), 'next.config.js')
  if (!fs.existsSync(configPath)) {
    log.error('next.config.js not found')
    hasErrors = true
    return
  }
  
  log.success('next.config.js exists')
  
  // Check for common issues
  const configContent = fs.readFileSync(configPath, 'utf8')
  
  if (configContent.includes('output: "export"')) {
    log.warn('Static export detected - API routes will not work')
  }
}

// Check for common deployment issues
function checkCommonIssues() {
  log.info('Checking for common deployment issues...')
  
  // Check for .env files that should not be committed
  if (fs.existsSync('.env')) {
    log.warn('.env file found - ensure it\'s in .gitignore')
  }
  
  // Check if vercel.json exists
  if (fs.existsSync('vercel.json')) {
    log.success('vercel.json configuration found')
  } else {
    log.warn('vercel.json not found (optional but recommended)')
  }
  
  // Check if public directory exists
  if (!fs.existsSync('public')) {
    log.warn('public directory not found (optional)')
  } else {
    log.success('public directory exists')
  }
  
  // Check for large files that might cause issues
  const checkLargeFiles = (dir, maxSize = 50 * 1024 * 1024) => {
    if (!fs.existsSync(dir)) return
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    files.forEach((file) => {
      const filePath = path.join(dir, file.name)
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        checkLargeFiles(filePath, maxSize)
      } else if (file.isFile()) {
        const stats = fs.statSync(filePath)
        if (stats.size > maxSize) {
          log.warn(`Large file detected: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`)
        }
      }
    })
  }
  
  checkLargeFiles('public')
  checkLargeFiles('src')
}

// Test build (optional, can be slow)
function testBuild() {
  log.info('Testing production build (this may take a while)...')
  
  try {
    execSync('npm run build', { stdio: 'pipe' })
    log.success('Production build successful')
  } catch (error) {
    log.error('Production build failed')
    log.error(error.stdout?.toString() || error.message)
    hasErrors = true
  }
}

// Main execution
async function main() {
  console.log('\n🚀 DocForge Deployment Pre-Check\n')
  
  checkNodeVersion()
  checkDependencies()
  checkEnvironmentVariables()
  checkTypeScript()
  checkLinting()
  checkNextConfig()
  checkCommonIssues()
  
  // Only run build test if --build flag is passed
  if (process.argv.includes('--build')) {
    testBuild()
  } else {
    log.info('Skipping build test (use --build flag to include)')
  }
  
  console.log('\n' + '='.repeat(50))
  
  if (hasErrors) {
    log.error('\n❌ Pre-deployment checks failed!')
    log.info('Fix the errors above before deploying to production.')
    process.exit(1)
  } else {
    log.success('\n✅ All pre-deployment checks passed!')
    log.info('Your project is ready to deploy to Vercel.')
    console.log('\nNext steps:')
    console.log('1. Push your code to GitHub')
    console.log('2. Import project in Vercel dashboard')
    console.log('3. Add environment variables in Vercel')
    console.log('4. Deploy!\n')
    process.exit(0)
  }
}

main().catch((error) => {
  log.error(`Unexpected error: ${error.message}`)
  process.exit(1)
})

