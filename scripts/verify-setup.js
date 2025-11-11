#!/usr/bin/env node

/**
 * DocForge Setup Verification Script
 * Checks if all required environment variables and configurations are set up
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const OPTIONAL_ENV_VARS = [
  'GITHUB_TOKEN',
];

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('   Create it by copying .env.example: cp .env.example .env.local');
    return false;
  }

  console.log('✅ .env.local file exists');
  
  // Read and parse .env.local
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  let allPresent = true;
  
  console.log('\n📋 Required Environment Variables:');
  REQUIRED_ENV_VARS.forEach(key => {
    const value = envVars[key];
    if (value && value !== `your_${key.toLowerCase().replace(/_/g, '_')}` && value.length > 0) {
      console.log(`   ✅ ${key}`);
    } else {
      console.log(`   ❌ ${key} - Not set or using placeholder`);
      allPresent = false;
    }
  });

  console.log('\n📋 Optional Environment Variables:');
  OPTIONAL_ENV_VARS.forEach(key => {
    const value = envVars[key];
    if (value && value.length > 0) {
      console.log(`   ✅ ${key}`);
    } else {
      console.log(`   ⚠️  ${key} - Not set (optional)`);
    }
  });

  return allPresent;
}

function checkFiles() {
  console.log('\n📁 Checking Required Files:');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'tailwind.config.ts',
    'src/app/layout.tsx',
    'src/middleware.ts',
    'supabase/migrations/001_initial_schema.sql',
  ];

  let allPresent = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - Missing`);
      allPresent = false;
    }
  });

  return allPresent;
}

function checkDependencies() {
  console.log('\n📦 Checking Dependencies:');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('   ❌ package.json not found');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules exists');
    console.log('   Run "npm install" if dependencies are missing');
    return true;
  } else {
    console.log('   ❌ node_modules not found');
    console.log('   Run "npm install" to install dependencies');
    return false;
  }
}

function main() {
  console.log('🔍 DocForge Setup Verification\n');
  console.log('='.repeat(50));
  
  const envOk = checkEnvFile();
  const filesOk = checkFiles();
  const depsOk = checkDependencies();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Summary:');
  
  if (envOk && filesOk && depsOk) {
    console.log('✅ All checks passed! You\'re ready to go.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Set up Supabase database (run SQL migrations)');
    console.log('   2. Create storage buckets in Supabase Dashboard');
    console.log('   3. Run "npm run dev" to start development');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.');
    process.exit(1);
  }
}

main();

