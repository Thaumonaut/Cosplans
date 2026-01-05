#!/bin/bash
# Update .env.test with new Supabase API key names

echo "🔧 Updating .env.test with new Supabase API keys..."

# Source staging environment
source .staging.env

# Backup current .env.test
cp .env.test .env.test.backup

# Update .env.test to include new API keys
cat >> .env.test << EOF

# ==========================================
# 🆕 New Supabase API Keys (v2)
# ==========================================
# Supabase is transitioning to new key names:
# - PUBLISHABLE_KEY replaces ANON_KEY
# - SECRET_KEY replaces SERVICE_ROLE_KEY
# Both sets work, but new keys are recommended

SUPABASE_PUBLISHABLE_KEY=${SUPABASE_PUBLISHABLE_KEY}
SUPABASE_SECRET_KEY=${SUPABASE_SECRET_KEY}
EOF

echo "✅ Updated .env.test with new API keys"
echo "📋 Backup saved as .env.test.backup"
