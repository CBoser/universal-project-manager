# Project Recovery Guide

## What Happened to My Projects?

Before authentication was added, all projects were stored in **browser localStorage only**. They were never synced to a database or server. This means:

- ✅ Projects exist **only** in the browser where you created them
- ✅ They cannot transfer between browsers or devices automatically
- ✅ Clearing browser data deletes them permanently
- ✅ They are NOT tied to any user account

**Now with authentication**, projects are synced to a PostgreSQL database and can be accessed from any device after login.

---

## Where Are My Projects?

### Scenario 1: Created Projects on Different Browser
If you created projects on Chrome but are now using Firefox (or vice versa):

**Solution:**
1. Open the **original browser** where you created projects
2. Go to `https://universal-pm-frontend.onrender.com`
3. Open Console (F12) and run the recovery script below
4. Export each project as JSON
5. Import them in your new browser after logging in

---

### Scenario 2: Created Projects on Different Device
If you created projects on your work computer but are now on your home computer:

**Solution:**
1. Access the **original device** where you created projects
2. Go to `https://universal-pm-frontend.onrender.com`
3. Run recovery script (below)
4. Export projects to JSON files
5. Email/transfer JSON files to yourself
6. Import them on your current device after logging in

---

### Scenario 3: Cleared Browser Data
If you cleared cookies, cache, or site data:

**Result:** ❌ **Projects are permanently lost**
- Browser localStorage was deleted
- Projects were never synced to database
- No recovery possible

**Going forward:**
- New projects will auto-sync to database
- Projects will persist even if you clear browser data

---

### Scenario 4: Using Different URL
If you originally accessed the app at `localhost:5173` or a different URL:

**Solution:**
1. Go to the **original URL** where you created projects
2. Run recovery script (below)
3. Export and import projects

---

## Recovery Script

### Step 1: Find Your Original Browser/Device

Go to the browser/device where you originally created projects.

### Step 2: Go to the Production URL

Visit: `https://universal-pm-frontend.onrender.com`

### Step 3: Run Recovery Script

Open Console (F12) and paste this:

```javascript
(function() {
  const projects = JSON.parse(localStorage.getItem('upm_projects') || '[]');

  if (projects.length === 0) {
    console.log('❌ No projects found in this browser');
    console.log('Try a different browser or device');
    return;
  }

  console.log(`✅ Found ${projects.length} projects!`);
  console.log('\nProjects:');
  projects.forEach((p, i) => {
    console.log(`${i+1}. ${p.meta?.name || 'Unnamed'} - ${p.tasks?.length || 0} tasks`);
  });

  console.log('\nTO EXPORT ALL PROJECTS:');
  console.log('Copy and paste each command below one at a time:\n');

  projects.forEach((p, i) => {
    const projectName = (p.meta?.name || 'Unnamed_Project').replace(/[^a-z0-9]/gi, '_');
    console.log(`// Export project ${i+1}: ${p.meta?.name || 'Unnamed'}`);
    console.log(`(function() {
  const project = ${JSON.stringify(p)};
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '${projectName}.json';
  a.click();
})();\n`);
  });
})();
```

### Step 4: Download Each Project

The script will generate export commands. Copy each command and run it to download that project as a JSON file.

### Step 5: Login on New Browser/Device

1. Go to `https://universal-pm-frontend.onrender.com`
2. Login with your account (coreyboser@gmail.com)
3. For each JSON file:
   - Click "+ New Project"
   - Click "Import Project (JSON)"
   - Select the JSON file
   - Project will be imported and synced to database

---

## Manual Sync Tool (If Projects Are in Current Browser)

If you're **already on the browser** with projects but they're not showing:

```javascript
// 1. First, check what's in localStorage
const localProjects = JSON.parse(localStorage.getItem('upm_projects') || '[]');
console.log('Projects in localStorage:', localProjects.length);

// 2. If you have projects, sync them to database
if (localProjects.length > 0) {
  (async function syncToDatabase() {
    console.log('Syncing', localProjects.length, 'projects to database...');

    for (let i = 0; i < localProjects.length; i++) {
      const project = localProjects[i];
      console.log(`Syncing ${i+1}/${localProjects.length}: ${project.meta?.name || 'Unnamed'}`);

      try {
        const response = await fetch('https://universal-pm-backend.onrender.com/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(project)
        });

        if (response.ok) {
          console.log('✅ Synced:', project.meta?.name);
        } else {
          console.error('❌ Failed:', project.meta?.name, response.status);
        }
      } catch (error) {
        console.error('❌ Error syncing:', project.meta?.name, error.message);
      }
    }

    console.log('Sync complete! Refresh the page.');
  })();
} else {
  console.log('No projects to sync');
}
```

After running this, refresh the page and your projects should appear.

---

## Prevention: How to Avoid Losing Projects Going Forward

### ✅ Always Use Authentication
- Login before creating projects
- Projects automatically sync to database
- Access from any device

### ✅ Regular Exports (Backup)
- Export important projects as JSON
- Keep backups in Google Drive, Dropbox, etc.
- Can restore even if database fails

### ✅ Use Same Account
- Always login with same email
- Projects are tied to your user account
- Persist across browsers and devices

---

## Common Questions

### Q: Can I recover projects if I cleared browser data?
**A:** No. If browser localStorage was cleared and projects weren't synced to database, they're gone forever.

### Q: I created projects last week. Where are they?
**A:** Check the browser/device where you created them. Run the recovery script there.

### Q: Will new projects disappear too?
**A:** No. New projects created after login automatically sync to the database and persist forever.

### Q: Can I merge projects from multiple browsers?
**A:** Yes! Export from each browser, then import all JSON files into your logged-in account.

### Q: I'm logged in but still don't see projects?
**A:** Projects created before authentication need to be manually exported/imported. They don't auto-sync to your account.

---

## Contact Support

If you've tried everything and still can't find your projects:

1. **Provide this information:**
   - When did you create the projects? (date/time)
   - What browser/device did you use?
   - What URL did you access? (localhost? render.com?)
   - Did you clear browser data recently?

2. **Check database directly:**
   If you have database access, you can query:
   ```sql
   SELECT id, meta->>'name' as name, user_id, created_at
   FROM projects
   WHERE user_id = 'your-user-id';
   ```

3. **Last resort:**
   If projects are truly lost, you'll need to recreate them. Sorry! 😞

---

## Summary

| Where Projects Were Created | Solution |
|----------------------------|----------|
| Same browser, before auth | Run manual sync tool above |
| Different browser | Export from original browser, import here |
| Different device | Access original device, export, transfer files |
| Different URL (localhost) | Access localhost, export projects |
| After clearing browser data | ❌ Cannot recover |
| Never created projects | Start fresh! Projects will now persist |

---

**The good news:** Going forward, all your projects will automatically sync to the database and you'll never lose them again! 🎉
