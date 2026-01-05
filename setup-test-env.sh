#!/bin/bash
# Script to automatically configure .env.test from .staging.env

echo "🔧 Setting up .env.test from .staging.env..."
echo ""

# Check if .staging.env exists
if [ ! -f .staging.env ]; then
    echo "❌ Error: .staging.env not found"
    exit 1
fi

# Source the staging environment variables
source .staging.env

# Create .env.test with staging credentials
cat > .env.test << EOF
# ==========================================
# TEST ENVIRONMENT CONFIGURATION
# ==========================================
# Auto-generated from .staging.env on $(date)
# Using Supabase STAGING branch for testing
#
# This file uses your staging branch credentials, which is perfect for:
# - Running tests locally without affecting production
# - CI/CD testing before merging to main
# - Feature branch testing with preview deployments

# ==========================================
# 🟢 Supabase Staging Branch Credentials
# ==========================================
# These are copied from your .staging.env file

SUPABASE_TEST_URL=${PUBLIC_SUPABASE_URL:-$SUPABASE_URL}
SUPABASE_TEST_KEY=${PUBLIC_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}

# Also set PUBLIC_ versions for SvelteKit compatibility
PUBLIC_SUPABASE_URL=${PUBLIC_SUPABASE_URL:-$SUPABASE_URL}
PUBLIC_SUPABASE_ANON_KEY=${PUBLIC_SUPABASE_ANON_KEY:-$SUPABASE_ANON_KEY}


# ==========================================
# 🔴 REQUIRED: Test User Credentials
# ==========================================
# You need to create a test user in your STAGING Supabase branch
# 
# Steps to create test user:
# 1. Go to Supabase Dashboard
# 2. Switch to STAGING branch (dropdown at top)
# 3. Go to Authentication → Users
# 4. Click "Add user"
# 5. Email: test@example.com
# 6. Password: testpassword123
# 7. ✅ Check "Auto Confirm User"
# 8. Click "Create User"
#
# Then update these values:

TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123


# ==========================================
# 🟡 Test Configuration
# ==========================================

# Base URL for E2E tests (local dev server)
TEST_BASE_URL=http://localhost:5173

# Environment
NODE_ENV=test

# Cosplans environment (matches staging)
COSPLANS_ENVIRONMENT=${COSPLANS_ENVIRONMENT:-staging}


# ==========================================
# 🟢 OPTIONAL: Additional staging variables
# ==========================================

# Service role key (only needed for integration tests that require admin access)
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Skip cleanup after tests (set to '1' to keep test data for debugging)
# TEST_SKIP_CLEANUP=0


# ==========================================
# ✅ SETUP CHECKLIST
# ==========================================
# Before running tests:
#
# ✅ 1. Staging branch exists in Supabase
# ✅ 2. Apply test schema functions to staging:
#        - Go to Supabase → Staging branch → SQL Editor
#        - Run: supabase/migrations/20250000000000_test_schema_functions.sql
# ☐ 3. Create test user in staging (see instructions above)
# ☐ 4. Update TEST_EMAIL and TEST_PASSWORD above
#
# To verify setup:
#   npm run test:verify
#
# To run tests:
#   npm run test:unit        # Fast (~30s) - Uses mocked Supabase
#   npm run test:integration # Medium (~2min) - Uses staging database
#   npm run test:e2e        # Slow (~10min) - Full browser tests on staging


# ==========================================
# 🔒 SECURITY NOTES
# ==========================================
# - This file uses STAGING credentials, not production
# - Still gitignored - never commit this file
# - Test user should only exist in staging
# - For CI/CD, use GitHub Secrets with staging credentials
EOF

echo "✅ Created .env.test with staging credentials"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create test user in Supabase STAGING branch:"
echo "   - Dashboard → Switch to staging → Authentication → Users"
echo "   - Add user: test@example.com / testpassword123"
echo "   - ✅ Auto Confirm User"
echo ""
echo "2. Apply test schema functions to staging:"
echo "   - Dashboard → Switch to staging → SQL Editor"
echo "   - Run: supabase/migrations/20250000000000_test_schema_functions.sql"
echo ""
echo "3. Verify setup:"
echo "   npm run test:verify"
echo ""
echo "4. Run tests:"
echo "   npm test"
echo ""
