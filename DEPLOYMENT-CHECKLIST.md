# 🚀 Quick Deployment Checklist

**Package:** `backend-deployment-fresh.zip` (~100KB)  
**Domain:** api.umiabroadstudies.com

---

## ✅ Pre-Deployment Checklist

- [ ] MongoDB Atlas database created and accessible
- [ ] MongoDB connection string ready
- [ ] Cloudinary account configured (cloud_name, api_key, api_secret)
- [ ] Email SMTP credentials ready (Gmail app password)
- [ ] Domain DNS pointing to server
- [ ] cPanel access credentials ready

---

## 📋 Deployment Steps (30-45 minutes)

### 1. Clean Server (5 min)
- [ ] Login to cPanel File Manager
- [ ] Navigate to `/home/[username]/api.umiabroadstudies.com/`
- [ ] Delete ALL existing files and folders
- [ ] Verify directory is empty

### 2. Upload Package (5 min)
- [ ] Upload `backend-deployment-fresh.zip`
- [ ] Extract the zip file
- [ ] Move files from `server/` folder to root directory
- [ ] Delete the zip file after extraction

### 3. Create .env File (10 min)
- [ ] Create new file named `.env`
- [ ] Copy template from `.env.production.template`
- [ ] Fill in all required values:
  - [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
  - [ ] `JWT_SECRET` - Generate random 64-char string
  - [ ] `JWT_REFRESH_SECRET` - Generate random 64-char string
  - [ ] `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
  - [ ] `CLOUDINARY_API_KEY` - Your Cloudinary API key
  - [ ] `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
  - [ ] `SMTP_EMAIL` - Your Gmail address
  - [ ] `SMTP_PASSWORD` - Gmail app-specific password
  - [ ] `ADMIN_EMAIL` - Admin login email
  - [ ] `ADMIN_PASSWORD` - Strong admin password
- [ ] Save the file

> **Generate JWT Secrets:** Use online tools or run locally:  
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4. Install Dependencies (10 min)
- [ ] Open cPanel Terminal
- [ ] `cd api.umiabroadstudies.com`
- [ ] `node --version` (verify >= 18.0.0)
- [ ] `npm install --production`
- [ ] Wait for completion (2-5 minutes)
- [ ] `ls node_modules` to verify

### 5. Configure Node.js App (5 min)
- [ ] cPanel → Setup Node.js App
- [ ] Create/Edit Application:
  - **Node.js Version:** 20.x
  - **App Mode:** Production
  - **App Root:** Your app directory path
  - **App URL:** api.umiabroadstudies.com
  - **Startup File:** server.cjs
  - **Additional Args:** `--no-experimental-fetch`
- [ ] Click Save

### 6. Start Application (2 min)
- [ ] Click "Start" or "Restart" in Node.js Manager
- [ ] Verify status shows "Running"

### 7. Verify Deployment (5 min)
Test these URLs in browser:

- [ ] `https://api.umiabroadstudies.com/` - Should show welcome message
- [ ] `https://api.umiabroadstudies.com/api/v1/auth/me` - Should return auth error (good!)
- [ ] `https://api.umiabroadstudies.com/api/v1/blogs` - Should return empty array or blogs
- [ ] Check browser console on frontend - No CORS errors
- [ ] No 503 errors

### 8. Seed Initial Data (Optional, 5 min)
```bash
cd api.umiabroadstudies.com
node seedSuperAdmin.js
node seedSiteContent.js
node seedBlogs.js
node seedContactSettings.js
```

---

## 🔍 Verification Tests

### Test 1: Health Check
```
GET https://api.umiabroadstudies.com/
```
✅ Expected: Welcome message or API info

### Test 2: Frontend Connection
- Open `https://umiabroadstudies.com`
- Open browser console (F12)
- ✅ No CORS errors
- ✅ API calls successful
- ✅ No 503 errors

### Test 3: Authentication
```
POST https://api.umiabroadstudies.com/api/v1/auth/login
Body: { "email": "admin@umiabroadstudies.com", "password": "your_password" }
```
✅ Expected: Login successful with token

---

## ⚠️ Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| **503 Service Unavailable** | Restart app in cPanel Node.js Manager |
| **CORS Errors** | Verify `FRONTEND_URL` in `.env`, restart app |
| **Connection Refused** | Check if app is running, verify port 3000 |
| **Module not found** | Run `npm install --production` again |
| **Database connection failed** | Check MongoDB Atlas IP whitelist, verify URI |
| **npm install fails** | Check Node.js version (must be >= 18) |

---

## 📞 Quick Commands Reference

```bash
# Navigate to app
cd api.umiabroadstudies.com

# Check Node.js version
node --version

# Install dependencies
npm install --production

# Start app (if not using cPanel manager)
npm start

# View logs
tail -f logs/error.log

# Check running processes
ps aux | grep node

# Restart (kill and restart via cPanel)
pkill node
```

---

## 📂 Files Included in Package

✅ Source code (controllers, models, routes, middleware, utils, config)  
✅ `server.cjs` (entry point)  
✅ `package.json` (dependencies)  
✅ `.gitignore`  
✅ `.htaccess`  
✅ Seeder scripts  

❌ node_modules (install on server)  
❌ .env files (create on server)  
❌ uploads folder contents  
❌ log files  

---

## 🎯 Success Criteria

- ✅ Backend API responding at api.umiabroadstudies.com
- ✅ No 503 errors
- ✅ No CORS errors from frontend
- ✅ Can login as admin
- ✅ Database connection working
- ✅ File uploads working (if tested)
- ✅ Email sending working (if tested)

---

**Total Time:** ~30-45 minutes  
**Difficulty:** Medium  
**Prerequisites:** cPanel access, MongoDB Atlas, Cloudinary account

---

**Need the full guide?** See `DEPLOYMENT-GUIDE.md` for detailed instructions.
