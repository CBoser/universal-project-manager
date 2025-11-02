#!/bin/bash
# Connect to Production Database
# Usage: ./scripts/db-connect.sh

echo "🔗 Connecting to production database..."
echo "💡 Tip: Type \\? for help, \\dt to list tables, \\q to quit"
echo ""

psql "postgresql://universal_project_manager_user:IrX8qmhbCM0CxErGfqVke6OtjjsY8J9i@dpg-d41unruuk2gs738r3e3g-a.oregon-postgres.render.com/universal_project_manager?sslmode=require"
