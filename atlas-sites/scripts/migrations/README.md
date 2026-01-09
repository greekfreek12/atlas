# Database Migrations

Run these in Supabase SQL Editor in order.

## Initial Setup
- `../schema.sql` - Full initial schema (run first for new databases)

## Migrations
- `001_add_analytics_events.sql` - Adds analytics_events table for tracking

## Running Migrations

For new databases:
```sql
-- Run schema.sql in Supabase SQL Editor
```

For existing databases, run migrations in order:
```sql
-- Run each numbered migration file in sequence
```
