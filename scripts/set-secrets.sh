#!/bin/bash
# Run this once to set secrets on your Supabase Edge Functions
# Install Supabase CLI first: https://supabase.com/docs/guides/cli

PROJECT_REF="penibtgqgnodrkgofdub"

echo "Setting Edge Function secrets..."

supabase secrets set \
  --project-ref $PROJECT_REF \
  ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

echo "✅ Secrets set on project $PROJECT_REF"
echo ""
echo "Edge Functions deployed:"
echo "  - add-stamp        (JWT required)"
echo "  - ai-mkt           (public)"
echo "  - survey-vote      (public)"
echo "  - register-customer(public)"
