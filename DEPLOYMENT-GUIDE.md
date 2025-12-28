# 🚀 Backend Fresh Deployment Guide

**Deployment Package:** `backend-deployment-fresh.zip`  
**Target Domain:** `api.umiabroadstudies.com`

---

## 📦 What's Included in the Zip

✅ **Included:**
- All source code files (`server.cjs`, controllers, models, routes, middleware, etc.)
- `package.json` (dependencies list)
- `.gitignore`
- `.htaccess` (for Apache/cPanel)
- Seeder scripts
- Utility files
- Empty `uploads` folder structure (if needed)

❌ **Excluded (Clean Deployment):**
- `node_modules` (will be installed fresh on server)
- `.env*` files (will be created manually on server)
- `package-lock.json` (will be generated fresh)
- `uploads` folder contents
- Log files
- Development artifacts

---

## 🗑️ Step 1: Clean Server (cPanel File Manager)

1. **Login to cPanel** → File Manager
2. **Navigate to:** `/home/[username]/api.umiabroadstudies.com/`
3. **Select ALL files and folders** in this directory
4. **Click Delete** → Confirm deletion
5. **Verify** the directory is completely empty

> ⚠️ **IMPORTANT:** Make sure to delete everything for a fresh start!

---

## 📤 Step 2: Upload Deployment Package

1. In **cPanel File Manager**, navigate to `/home/[username]/api.umiabroadstudies.com/`
2. **Click Upload** button
3. **Select:** `backend-deployment-fresh.zip`
4. Wait for upload to complete
5. **Right-click** the zip file → **Extract**
6. **Delete** the zip file after extraction
7. **Move all files** from the extracted `server` folder to the root directory

> 💡 **Note:** After extraction, you should see `server.cjs`, `package.json`, `controllers/`, etc. directly in the `api.umiabroadstudies.com` folder.

---

## 🔐 Step 3: Create .env File

1. In cPanel File Manager, **click "+ File"**
2. **Name:** `.env`
3. **Right-click** → Edit
4. **Paste the following template** with your actual values:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
API_URL=https://api.umiabroadstudies.com

# Frontend URL (for CORS)
FRONTEND_URL=https://umiabroadstudies.com

# Database
MONGODB_URI=your_mongodb_atlas_connection_string_here

# JWT Secrets (generate random strings)
JWT_SECRET=your_very_long_random_secret_key_here
JWT_REFRESH_SECRET=your_very_long_random_refresh_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Cookie Settings
COOKIE_EXPIRE=7

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password

# Email Settings
EMAIL_FROM=noreply@umiabroadstudies.com
EMAIL_FROM_NAME=Umia Broad Studies

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@umiabroadstudies.com
ADMIN_PASSWORD=your_secure_admin_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Click Save Changes**

> 🔒 **Security Tips:**
> - Generate strong random strings for JWT secrets (50+ characters)
> - Use a strong admin password
> - Never commit `.env` file to Git

---

## 📦 Step 4: Install Dependencies

### Using cPanel Terminal:

1. **cPanel** → **Terminal**
2. Navigate to your application:
   ```bash
   cd api.umiabroadstudies.com
   ```

3. **Verify Node.js version:**
   ```bash
   node --version
   ```
   > Should be >= 18.0.0 (preferably Node.js 20.x)

4. **Install dependencies:**
   ```bash
   npm install --production
   ```
   > This will take 2-5 minutes. Wait for completion!

5. **Verify installation:**
   ```bash
   ls node_modules
   ```
   > Should show all installed packages

---

## 🚀 Step 5: Configure Node.js Application (Webuzo/cPanel)

1. **cPanel** → **Setup Node.js App** (or Application Manager)
2. **Click "Create Application"** or edit existing
3. **Configure:**
   - **Node.js Version:** 20.x or 18.x
   - **Application Mode:** Production
   - **Application Root:** `/home/[username]/api.umiabroadstudies.com`
   - **Application URL:** `api.umiabroadstudies.com`
   - **Application Startup File:** `server.cjs`
   - **Environment Variables:** (Add if not using .env)
     - `NODE_ENV=production`
   - **Additional Run Command:** `--no-experimental-fetch`

4. **Click "Create"** or **"Save"**

---

## ▶️ Step 6: Start the Application

### Method 1: Using cPanel Node.js Manager
1. Go to **Setup Node.js App**
2. Find your application
3. Click **"Start"** or **"Restart"**
4. Wait for status to show **"Running"**

### Method 2: Using Terminal
```bash
cd api.umiabroadstudies.com
npm start
```

---

## ✅ Step 7: Verify Deployment

### 1. Check Application Status
- In cPanel → Setup Node.js App → Status should be **"Running"**

### 2. Test API Endpoints

**Health Check:**
```
https://api.umiabroadstudies.com/
```
Expected response: Welcome message or API info

**Auth Endpoint:**
```
https://api.umiabroadstudies.com/api/v1/auth/me
```
Expected: Should return an authentication error (means backend is working)

**Blogs Endpoint:**
```
https://api.umiabroadstudies.com/api/v1/blogs
```
Expected: Should return blogs data (or empty array if not seeded)

### 3. Browser Console Test
Open your frontend (`https://umiabroadstudies.com`) and check:
- No CORS errors in console
- API calls are successful
- No 503 errors

---

## 🌱 Step 8: Seed Initial Data (Optional)

If you want to populate the database with initial data:

```bash
cd api.umiabroadstudies.com
node seedSuperAdmin.js
node seedSiteContent.js
node seedBlogs.js
node seedJobs.js
node seedAboutUs.js
node seedContactSettings.js
```

Or seed everything at once:
```bash
node seedAll.js
```

---

## 🔧 Troubleshooting

### Issue: 503 Service Unavailable

**Possible Causes:**
1. Application not started
2. Wrong Node.js version
3. Missing dependencies
4. Port conflict
5. Environment variables not set

**Solutions:**
- Check app status in cPanel Node.js Manager
- Restart the application
- Verify `node_modules` exists and is complete
- Check error logs in cPanel

### Issue: CORS Errors

**Solution:**
- Verify `FRONTEND_URL` in `.env` matches your actual frontend URL
- Restart the application after changing `.env`

### Issue: Database Connection Failed

**Solution:**
- Verify MongoDB Atlas connection string in `.env`
- Check if IP whitelist includes your server IP (use `0.0.0.0/0` for all IPs)
- Ensure database user has proper permissions

### Issue: npm install fails

**Solution:**
- Check Node.js version (must be >= 18.0.0)
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and try again

---

## 📊 Monitoring

### View Logs (cPanel Terminal)
```bash
cd api.umiabroadstudies.com
tail -f logs/error.log
tail -f logs/combined.log
```

### Check Process
```bash
ps aux | grep node
```

### Restart Application
```bash
# Via cPanel Node.js Manager (recommended)
# OR
pkill node
npm start
```

---

## 🎯 Next Steps After Deployment

1. ✅ **Test all API endpoints** via Postman or frontend
2. ✅ **Verify CORS** works from frontend
3. ✅ **Test file uploads** (if using Cloudinary)
4. ✅ **Test email sending** (password reset, etc.)
5. ✅ **Configure SSL certificate** (if not already done)
6. ✅ **Set up monitoring** (uptime monitoring, error tracking)
7. ✅ **Update frontend .env** to point to production API

---

## 📝 Important Notes

- ⚠️ **Never commit `.env` files** to version control
- 🔄 **Always backup** before deploying updates
- 📧 **Test email functionality** after deployment
- 🔐 **Change default admin password** immediately after seeding
- 🌐 **Verify DNS settings** for your domain
- 📱 **Test from multiple devices** and networks

---

## 🆘 Getting Help

If you encounter issues:
1. Check error logs in cPanel
2. Verify all environment variables are set correctly
3. Ensure Node.js version is compatible
4. Check MongoDB Atlas connection
5. Verify Cloudinary credentials
6. Contact hosting support if server-related issues

---

**Deployment Date:** December 27, 2025  
**Package Version:** 1.0.0  
**Node.js Required:** >= 18.0.0  
**Database:** MongoDB Atlas

---

Good luck with your deployment! 🚀
