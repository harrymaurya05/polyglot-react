#!/bin/bash

# Installation and Setup Script for react-translate-ai-custom
# This script helps you get started quickly

set -e

echo "🌍 React Translate AI Custom - Setup Script"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm found: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 2: Build the library
echo "🔨 Step 2: Building the library..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Library built successfully"
else
    echo -e "${RED}❌ Failed to build library${NC}"
    exit 1
fi
echo ""

# Step 3: Run type checking
echo "🔍 Step 3: Running type checks..."
npm run type-check

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Type checking passed"
else
    echo -e "${YELLOW}⚠${NC} Type checking had warnings (this is okay for now)"
fi
echo ""

# Step 4: Offer to set up example
echo "📚 Step 4: Example application setup"
read -p "Would you like to set up the example application? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting up example application..."
    cd examples/basic-example
    
    echo "Installing example dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Example dependencies installed"
    else
        echo -e "${RED}❌ Failed to install example dependencies${NC}"
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo ""
        echo -e "${YELLOW}⚠${NC} No .env file found in examples/basic-example"
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo ""
        echo -e "${YELLOW}⚠${NC} Please edit examples/basic-example/.env and add your API key"
        echo "Then run: cd examples/basic-example && npm run dev"
    else
        echo -e "${GREEN}✓${NC} .env file already exists"
    fi
    
    cd ../..
fi

echo ""
echo "============================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "============================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Get a translation API key:"
echo "   - Google: https://console.cloud.google.com/"
echo "   - DeepL: https://www.deepl.com/pro-api"
echo "   - AWS: https://console.aws.amazon.com/"
echo ""
echo "2. Add your API key to examples/basic-example/.env:"
echo "   VITE_TRANSLATE_API_KEY=your_key_here"
echo ""
echo "3. Run the example app:"
echo "   cd examples/basic-example"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full README: README.md"
echo "   - API Reference: src/types/index.ts"
echo ""
echo "💡 Tip: Start with Google Translate API for easiest setup"
echo ""
echo -e "${GREEN}Happy translating! 🌍✨${NC}"
