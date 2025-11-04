# Quick Diagnostic Script

## Run This in Your Browser Console

1. Visit: `https://universal-pm-frontend.onrender.com`
2. Press **F12** (Windows/Linux) or **Cmd+Option+I** (Mac)
3. Click the **Console** tab
4. Copy and paste this ENTIRE script and press Enter:

```javascript
(async function diagnose() {
  console.log('='.repeat(80));
  console.log('UNIVERSAL PM DIAGNOSTIC SCRIPT');
  console.log('='.repeat(80));

  // 1. Check frontend configuration
  console.log('\n1. FRONTEND CONFIGURATION:');
  console.log('   Current URL:', window.location.href);
  console.log('   Backend URL:', import.meta?.env?.VITE_BACKEND_URL || 'NOT SET - using default');
  console.log('   Default fallback:', 'http://localhost:3001');

  // 2. Check localStorage
  console.log('\n2. LOCAL STORAGE:');
  console.log('   Sync enabled:', localStorage.getItem('upm_sync_enabled'));
  console.log('   Last sync:', localStorage.getItem('upm_last_sync_time'));
  console.log('   Projects count:', (JSON.parse(localStorage.getItem('upm_projects') || '[]')).length);

  // 3. Test backend connection
  console.log('\n3. BACKEND CONNECTION TEST:');
  const backendUrl = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:3001';

  try {
    console.log('   Testing health endpoint...');
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    console.log('   Health check status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Health check response:', healthData);
    }
  } catch (error) {
    console.error('   ❌ Health check FAILED:', error.message);
  }

  try {
    console.log('   Testing auth endpoint...');
    const authResponse = await fetch(`${backendUrl}/api/auth/me`, {
      credentials: 'include'
    });
    console.log('   Auth check status:', authResponse.status);
    if (authResponse.status === 401) {
      console.log('   ✅ Not logged in (expected)');
    } else if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('   ✅ User data:', authData);
    }
  } catch (error) {
    console.error('   ❌ Auth check FAILED:', error.message);
  }

  // 4. Check for React app
  console.log('\n4. REACT APP STATUS:');
  const rootElement = document.getElementById('root');
  console.log('   Root element exists:', !!rootElement);
  console.log('   Root element has content:', rootElement?.innerHTML?.length > 0);
  console.log('   Body text preview:', document.body.innerText.substring(0, 200));

  // 5. Check for login form
  console.log('\n5. LOGIN FORM CHECK:');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.querySelector('input[type="password"]');
  const loginButton = document.querySelector('button[type="submit"]');
  console.log('   Email input exists:', !!emailInput);
  console.log('   Password input exists:', !!passwordInput);
  console.log('   Submit button exists:', !!loginButton);

  // 6. Check for dashboard elements
  console.log('\n6. DASHBOARD CHECK:');
  const logoutButton = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Logout'));
  const userInfo = document.querySelector('header')?.innerText;
  console.log('   Logout button exists:', !!logoutButton);
  console.log('   Header content:', userInfo);

  // 7. Console error check
  console.log('\n7. JAVASCRIPT ERRORS:');
  console.log('   Check above for any red error messages');

  console.log('\n' + '='.repeat(80));
  console.log('DIAGNOSTIC COMPLETE');
  console.log('Copy ALL output above and send to developer');
  console.log('='.repeat(80));
})();
```

## After Running the Script

**Copy EVERYTHING that appears in the console** (all the output from the diagnostic script) and send it back.

This will tell me:
- ✅ If the backend URL is configured correctly
- ✅ If the backend is reachable
- ✅ If you're seeing the login form or dashboard
- ✅ What errors are occurring

---

## Alternative: Take Screenshots

If you can't run the script, please take these screenshots:

1. **Screenshot 1:** The full browser window showing what you see
2. **Screenshot 2:** Browser console (F12 → Console tab) showing all messages
3. **Screenshot 3:** Browser Network tab (F12 → Network → refresh page → show failed requests in red)

---

## Quick Check: Are These Environment Variables Set?

While I wait for the diagnostic output, please verify in Render Dashboard:

### Backend Service (universal-pm-backend) → Environment tab:
- [ ] `FRONTEND_URL` = `https://universal-pm-frontend.onrender.com`
- [ ] `DATABASE_URL` = (should be set automatically)
- [ ] `SESSION_SECRET` = (any long random string)
- [ ] `NODE_ENV` = `production`

### Frontend Service (universal-pm-frontend) → Environment tab:
- [ ] `VITE_BACKEND_URL` = `https://universal-pm-backend.onrender.com`

**If ANY of these are missing, add them and redeploy before running the diagnostic script.**
