#!/bin/bash
# Applica le migrazioni a Supabase Cloud
# Uso: ./scripts/deploy-migrations.sh postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
set -e
echo "Applying migrations to Supabase Cloud..."
npx supabase db push --db-url "$1"
echo "Done! Migration count:"
npx supabase migration list
