#!/bin/bash

# DocForge Setup Script
echo "🚀 DocForge Setup Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local"
        echo "⚠️  Please edit .env.local and add your API keys:"
        echo "   - NEXT_PUBLIC_SUPABASE_URL"
        echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "   - SUPABASE_SERVICE_ROLE_KEY"
        echo "   - OPENAI_API_KEY"
        echo "   - NEXT_PUBLIC_APP_URL"
    else
        echo "⚠️  .env.example not found. Please create .env.local manually."
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit .env.local and add your API keys"
echo "2. Set up Supabase database (run migrations from supabase/migrations/)"
echo "3. Create storage buckets in Supabase Dashboard"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "✅ Setup complete! Run 'npm run dev' to start developing."

