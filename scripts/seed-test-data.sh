#!/usr/bin/env bash
set -euo pipefail

# Seed test data into Supabase for E2E tests.
# Usage: ./scripts/seed-test-data.sh
#
# Requires:
#   SUPABASE_URL          — your Supabase project URL
#   SUPABASE_SERVICE_ROLE_KEY — service_role key (NOT anon key)
#
# These can be set in .env.test or exported before running.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SEED_SQL="$PROJECT_DIR/supabase/seed-test-accounts.sql"

# Load .env.test if present
if [ -f "$PROJECT_DIR/.env.test" ]; then
  echo "Loading .env.test..."
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env.test"
  set +a
fi

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  echo "Either export them or add them to .env.test"
  exit 1
fi

if [ ! -f "$SEED_SQL" ]; then
  echo "ERROR: Seed SQL not found at $SEED_SQL"
  exit 1
fi

echo "Applying seed migration to $SUPABASE_URL..."

# Execute SQL via Supabase REST API (PostgREST RPC)
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(cat "$SEED_SQL" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.stringify(d)))")}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "Seed migration applied successfully."
else
  echo "ERROR: HTTP $HTTP_CODE"
  echo "$BODY"
  echo ""
  echo "If exec_sql RPC is not available, apply manually:"
  echo "  1. Go to Supabase Dashboard > SQL Editor"
  echo "  2. Paste contents of $SEED_SQL"
  echo "  3. Click Run"
  exit 1
fi

echo "Verifying test accounts..."

# Verify artist account exists
ARTIST_CHECK=$(curl -s \
  "${SUPABASE_URL}/rest/v1/users?id=eq.a1111111-1111-1111-1111-111111111111&select=id,email" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

if echo "$ARTIST_CHECK" | grep -q "testartist@ncsound.test"; then
  echo "  ✓ Artist account (testartist@ncsound.test) exists"
else
  echo "  ✗ Artist account not found — check seed SQL"
fi

# Verify admin account exists
ADMIN_CHECK=$(curl -s \
  "${SUPABASE_URL}/rest/v1/users?id=eq.b2222222-2222-2222-2222-222222222222&select=id,email" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

if echo "$ADMIN_CHECK" | grep -q "testadmin@ncsound.test"; then
  echo "  ✓ Admin account (testadmin@ncsound.test) exists"
else
  echo "  ✗ Admin account not found — check seed SQL"
fi

echo ""
echo "Done. E2E auth tests should now pass with:"
echo "  TEST_ARTIST_EMAIL=testartist@ncsound.test"
echo "  TEST_ARTIST_PASSWORD=test123"
echo "  TEST_ADMIN_EMAIL=testadmin@ncsound.test"
echo "  TEST_ADMIN_PASSWORD=test123"
