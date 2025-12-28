# Frontend Deployment Guide - umiabroadstudies.com

## 📦 Deployment Package Ready

**File:** `frontend-deployment.zip`  
**Target:** `umiabroadstudies.com` (public_html)

---

## 🚀 Deployment Steps

### Step 1: Backup Existing Frontend (Optional but Recommended)

1. Log in to **cPanel**
2. Go to **File Manager**
3. Navigate to `public_html` (or `umiabroadstudies.com` folder)
4. Select all files
5. Click **Compress** → Create `backup-old-frontend.zip`
6. Download the backup to your computer

---

### Step 2: Clean the Deployment Directory

1. In File Manager, navigate to `public_html`
2. **Delete all existing files** (except `.htaccess` if you have custom rules)
3. Keep the directory clean for fresh deployment

---

### Step 3: Upload Frontend Build

1. Click **Upload** in File Manager
2. Select `frontend-deployment.zip` from your computer
3. Wait for upload to complete
4. **Extract** the zip file
5. **Move all files** from the extracted folder to the root of `public_html`
6. Delete the empty folder and zip file

**Your `public_html` should now contain:**
```
public_html/
├── index.html
├── assets/
│   ├── index-xxxxx.js
│   ├── index-xxxxx.css
│   └── ...
└── .htaccess (create if not exists)
```

---

### Step 4: Create/Update .htaccess for React Router

Create or edit `.htaccess` in `public_html` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirect to HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Handle React Router (SPA)
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**This ensures:**
- ✅ HTTPS redirection
- ✅ React Router works properly (all routes go to index.html)
- ✅ Static assets load correctly

---

### Step 5: Verify Deployment

#### 5.1 Test Homepage
Visit: `https://umiabroadstudies.com`

**Expected:** Your landing page loads correctly

#### 5.2 Test API Connection
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Check for any errors
4. Navigate to login page
5. Try logging in

**Expected:** No CORS errors, API calls go to `https://api2.umiabroadstudies.com`

#### 5.3 Test Routing
Click around different pages:
- `/about`
- `/services`
- `/contact`
- `/admin/login`

**Expected:** All routes work without 404 errors

---

## 🔍 Troubleshooting

### Issue: "404 Not Found" on refresh
**Solution:** Check `.htaccess` is configured correctly with React Router rules

### Issue: CORS errors in console
**Solution:** 
1. Verify backend `.env` has `CLIENT_URL=https://umiabroadstudies.com`
2. Restart backend: `pkill -f server.cjs` then start again

### Issue: Blank white page
**Solution:**
1. Check browser console for errors
2. Verify all files extracted correctly
3. Check `index.html` exists in root

### Issue: API calls failing
**Solution:**
1. Check `.env.production` has correct API URL
2. Rebuild frontend: `npm run build`
3. Re-upload

---

## 📊 Deployment Checklist

- [ ] Backed up old frontend
- [ ] Cleaned deployment directory
- [ ] Uploaded `frontend-deployment.zip`
- [ ] Extracted all files to root
- [ ] Created/updated `.htaccess`
- [ ] Tested homepage loads
- [ ] Verified API connection works
- [ ] Tested React Router (different routes)
- [ ] Checked for console errors
- [ ] Tested login functionality

---

## ✅ Post-Deployment

### Update DNS (if needed)
If you moved from a different domain, update DNS A records to point to your server IP: `65.108.142.88`

### Enable SSL (if not already)
1. In cPanel, go to **SSL/TLS Status**
2. Enable AutoSSL for `umiabroadstudies.com`
3. Wait for certificate to install

### Monitor Logs
- **Backend logs:** `tail -f ~/api2_app.log` in cPanel Terminal
- **Browser console:** Check for any runtime errors

---

## 🎯 Success Criteria

✅ Frontend loads at `https://umiabroadstudies.com`  
✅ API calls go to `https://api2.umiabroadstudies.com`  
✅ No CORS errors  
✅ React Router works on all pages  
✅ Login/Authentication works  
✅ Socket.io connections establish  

---

**Your frontend is now deployed and connected to the backend!** 🚀
