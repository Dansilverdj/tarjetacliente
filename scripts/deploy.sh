#!/bin/bash
# Deploy tarjetacliente.vip to Vercel
# Prerequisites: npm install -g vercel

echo "🚀 Deploying tarjetacliente.vip..."

# Build check
echo "Running type check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found. Fix before deploying."
  exit 1
fi

echo "✅ Type check passed"

# Deploy
vercel --prod \
  --env NEXT_PUBLIC_SUPABASE_URL="https://penibtgqgnodrkgofdub.supabase.co" \
  --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --env ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  --env NEXT_PUBLIC_APP_URL="https://tarjetacliente.vip"

echo ""
echo "✅ Deployed!"
echo "🌐 Configure custom domain: tarjetacliente.vip → Settings → Domains in Vercel"
