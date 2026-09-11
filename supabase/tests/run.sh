#!/usr/bin/env bash
# Applies the shim, every migration, then the RLS scenario tests on a fresh local database.
set -euo pipefail
DB="${TEST_DB:-cybarq_test}"
PSQL="psql -v ON_ERROR_STOP=1 -q -X"
export PGUSER="${PGUSER:-postgres}" PGPASSWORD="${PGPASSWORD:-postgres}" PGHOST="${PGHOST:-localhost}" PGPORT="${PGPORT:-5432}"
psql -X -q -c "drop database if exists $DB" postgres
psql -X -q -c "create database $DB" postgres
$PSQL -d "$DB" -f supabase/tests/00_supabase_shim.sql
for f in supabase/migrations/*.sql; do
  echo "applying $(basename "$f")"
  $PSQL -d "$DB" -f "$f"
done
for f in supabase/tests/[1-9]*.sql; do
  echo "test $(basename "$f")"
  $PSQL -d "$DB" -f "$f"
done
echo "all database tests passed"
