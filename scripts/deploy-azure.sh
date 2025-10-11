#!/bin/bash

# OnePortal Azure Static Web App Deployment Script
# Builds all apps and merges them into a single deployment directory

set -e  # Exit on error

echo "🚀 OnePortal Deployment Builder"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Building all applications...${NC}"
pnpm build

echo -e "${BLUE}🗑️  Cleaning previous deployment...${NC}"
rm -rf deploy

echo -e "${BLUE}📁 Creating deployment directory structure...${NC}"
mkdir -p deploy

echo -e "${BLUE}📋 Copying shell app to root (/)...${NC}"
cp -r apps/shell/dist/* deploy/

echo -e "${BLUE}📋 Copying billing app to /billing/...${NC}"
mkdir -p deploy/billing
cp -r apps/remote-billing/dist/* deploy/billing/

echo -e "${BLUE}📋 Copying reports app to /reports/...${NC}"
mkdir -p deploy/reports
cp -r apps/remote-reports/dist/* deploy/reports/

echo ""
echo -e "${GREEN}✅ Deployment directory ready!${NC}"
echo ""
echo "📂 Structure:"
echo "   deploy/"
echo "   ├── index.html              (shell)"
echo "   ├── assets/                 (shell assets)"
echo "   ├── billing/"
echo "   │   ├── index.html"
echo "   │   └── assets/"
echo "   └── reports/"
echo "       ├── index.html"
echo "       └── assets/"
echo ""
echo -e "${GREEN}🎯 Next steps:${NC}"
echo "   1. Test locally: cd deploy && npx http-server -p 8080"
echo "   2. Deploy to Azure Static Web Apps"
echo ""
