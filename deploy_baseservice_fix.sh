#!/bin/bash

# deploy_baseservice_fix.sh
# Automated deployment script for BaseService resolution fix

echo "🚀 BaseService Resolution Fix - Deployment Script"
echo "================================================="

# Check if clasp is authenticated
echo "📋 Checking clasp authentication..."
if clasp status > /dev/null 2>&1; then
    echo "✅ Clasp authenticated and ready"
else
    echo "❌ Clasp not authenticated. Please run 'clasp login' first"
    exit 1
fi

# Show current project info
echo ""
echo "📂 Project Information:"
clasp status

# Validate critical files exist
echo ""
echo "🔍 Validating critical files..."
CRITICAL_FILES=(
    "src/00_ServiceInitializer.js"
    "src/services/BaseService.js"
    "src/database/DatabaseService.js"
    "src/services/ValidationService.js"
    "src/TestBaseServiceResolution.js"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing - deployment aborted"
        exit 1
    fi
done

# Check file sizes to ensure they're not empty
echo ""
echo "📊 File validation:"
echo "00_ServiceInitializer.js: $(wc -l < src/00_ServiceInitializer.js) lines"
echo "BaseService.js: $(wc -l < src/services/BaseService.js) lines"
echo "DatabaseService.js: $(wc -l < src/database/DatabaseService.js) lines"
echo "TestBaseServiceResolution.js: $(wc -l < src/TestBaseServiceResolution.js) lines"

# Show what will be deployed
echo ""
echo "📦 Files to be deployed (in order):"
head -20 .clasp.json | grep -E '\.js"|\.gs"' | sed 's/.*"\(.*\)".*/    ✓ \1/'

# Confirm deployment
echo ""
read -p "🎯 Deploy BaseService fix to Google Apps Script? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏹️  Deployment cancelled"
    exit 0
fi

# Deploy the files
echo ""
echo "⬆️  Pushing files to Google Apps Script..."
if clasp push; then
    echo "✅ Files deployed successfully!"
else
    echo "❌ Deployment failed!"
    exit 1
fi

# Show post-deployment instructions
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo ""
echo "📋 Next Steps - Run these commands in Google Apps Script console:"
echo ""
echo "1️⃣  Test the original error (should now work):"
echo "    testOriginalError();"
echo ""
echo "2️⃣  Run full service validation:"
echo "    testBaseServiceResolution();"
echo ""
echo "3️⃣  Check service health:"
echo "    performServiceHealthCheck();"
echo ""
echo "4️⃣  Verify initialization system:"
echo "    initializeServices();"
echo ""
echo "📊 Expected Results:"
echo "    ✅ All tests should pass"
echo "    ✅ No 'BaseService is not defined' errors"
echo "    ✅ Services instantiate correctly"
echo "    ✅ 100% success rate"
echo ""
echo "🔗 Open your Apps Script project:"
echo "    clasp open"
echo ""
echo "Good luck! 🚀"
