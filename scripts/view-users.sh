#!/bin/bash
# View Users in Production Database
# Usage: ./scripts/view-users.sh

echo "🔍 Fetching users from production database..."
echo ""

psql "postgresql://universal_project_manager_user:IrX8qmhbCM0CxErGfqVke6OtjjsY8J9i@dpg-d41unruuk2gs738r3e3g-a.oregon-postgres.render.com/universal_project_manager?sslmode=require" <<EOF
\echo '📊 User Statistics:'
SELECT
    COUNT(*) as total_users,
    COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as logged_in_users,
    COUNT(CASE WHEN active = true THEN 1 END) as active_users
FROM users;

\echo ''
\echo '👥 All Users:'
SELECT
    email,
    name,
    role,
    CASE WHEN active THEN '✓' ELSE '✗' END as active,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as registered,
    CASE
        WHEN last_login IS NULL THEN 'Never'
        ELSE TO_CHAR(last_login, 'YYYY-MM-DD HH24:MI')
    END as last_login
FROM users
ORDER BY created_at DESC;

\echo ''
\echo '📁 Users with Projects:'
SELECT
    u.email,
    u.name,
    COUNT(p.id) as projects
FROM users u
LEFT JOIN projects p ON u.id = p.user_id
GROUP BY u.id, u.email, u.name
ORDER BY projects DESC;
EOF

echo ""
echo "✅ Done!"
