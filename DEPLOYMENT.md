# Deployment Guide for Builder's Lab

## 🌐 Domain: thebuilderslab.pro

This guide will walk you through deploying Builder's Lab to Vercel with your custom domain.

## 📦 Step 1: Push to GitHub

Your code is already committed locally. Now create a GitHub repository:

### Option A: Using GitHub Website
1. Go to [github.com](https://github.com/new)
2. Create a new repository named `builders-lab` (or any name you prefer)
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL (e.g., `https://github.com/yourusername/builders-lab.git`)

### Option B: Using GitHub CLI
```bash
gh repo create builders-lab --public --source=. --remote=origin --push
```

### Manual Git Push
If you used Option A, connect your local repo to GitHub:

```bash
cd D:\projects\the_builders_lab_app

# Add the remote (replace with your actual repo URL)
git remote add origin https://github.com/yourusername/builders-lab.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your `builders-lab` repository
5. Vercel will auto-detect Next.js settings

### 2.2 Configure Build Settings
Vercel should auto-detect these, but verify:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or higher

### 2.3 Add Environment Variables
In the Vercel project settings, add these environment variables:

**Required:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

**For Implementation Library (Private):**
```
NOTION_API_KEY=your_notion_integration_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

**For Resources Page (Public):**
```
PUBLIC_NOTION_API_KEY=your_public_notion_api_key
PUBLIC_DATABASE_ID=your_public_database_id
```

**App URL:**
```
NEXT_PUBLIC_APP_URL=https://thebuilderslab.pro
```

### 2.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Vercel will provide a preview URL (e.g., `builders-lab.vercel.app`)

## 🌐 Step 3: Connect Custom Domain

### 3.1 Add Domain in Vercel
1. Go to your project settings in Vercel
2. Click on "Domains"
3. Click "Add Domain"
4. Enter: `thebuilderslab.pro`
5. Click "Add"

### 3.2 Add www Subdomain (Recommended)
1. Also add: `www.thebuilderslab.pro`
2. Vercel will redirect www to the apex domain automatically

### 3.3 Configure DNS
Vercel will show you the DNS records to add. You need to add these at your domain registrar:

**For Apex Domain (thebuilderslab.pro):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Alternative CNAME Setup:**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**For www Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3.4 Wait for DNS Propagation
- DNS changes can take 24-48 hours to fully propagate
- Usually works within 1-2 hours
- Vercel will automatically provision SSL certificate once DNS is configured

## 🔒 Step 4: Update Supabase Settings

### 4.1 Update Redirect URLs
In your Supabase project:

1. Go to **Authentication > URL Configuration**
2. Add these to **Redirect URLs:**
   ```
   https://thebuilderslab.pro/auth/callback
   https://www.thebuilderslab.pro/auth/callback
   https://thebuilderslab.pro
   https://www.thebuilderslab.pro
   ```

### 4.2 Update Site URL
Set **Site URL** to:
```
https://thebuilderslab.pro
```

## 💳 Step 5: Update Payment Redirect

Update your payment provider's success URL to:
```
https://thebuilderslab.pro/signup
```

This ensures users land on the signup page after payment.

## ✅ Step 6: Verify Deployment

Test these critical paths:

1. ✅ Home page: `https://thebuilderslab.pro`
2. ✅ Resources page (public): `https://thebuilderslab.pro/resources`
3. ✅ Signup page: `https://thebuilderslab.pro/signup`
4. ✅ Login page: `https://thebuilderslab.pro/login`
5. ✅ Dashboard (after login): `https://thebuilderslab.pro/dashboard`
6. ✅ All tools accessible from dashboard
7. ✅ Implementation library loading Notion content
8. ✅ Resources page loading public Notion database

## 🔄 Step 7: Set Up Auto-Deploy

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git add . && git commit -m "your message"`
3. Push: `git push`
4. Vercel automatically builds and deploys

## 📊 Monitoring

### Vercel Dashboard
- **Analytics:** Track page views and performance
- **Logs:** View function logs and errors
- **Speed Insights:** Monitor Core Web Vitals

### Supabase Dashboard
- **Database:** Monitor queries and connections
- **Auth:** Track user signups and sessions
- **API:** Monitor API usage

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Verify all environment variables are set
- Ensure `package.json` dependencies are correct

### Domain Not Working
- Wait 24-48 hours for DNS propagation
- Verify DNS records are correct at registrar
- Check Vercel domain status (should show "Valid")

### Authentication Errors
- Verify Supabase redirect URLs include your domain
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- Clear browser cookies and try again

### Notion Content Not Loading
- Verify Notion API keys in Vercel environment variables
- Check that Notion databases are shared with integration
- Review Vercel function logs for specific errors

## 🔐 Security Checklist

- ✅ All API keys stored in Vercel environment variables
- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ Supabase RLS policies enabled on all tables
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Rate limiting on API routes (consider adding)

## 📈 Post-Deployment

### Performance
- Enable Vercel Speed Insights
- Monitor Core Web Vitals
- Optimize images with Next.js Image component

### Analytics
- Add Google Analytics (optional)
- Track conversion from /resources to /signup
- Monitor user journey through tools

### Marketing
- Update payment provider with production URL
- Test complete user flow: payment → signup → dashboard
- Share resources page link for top-of-funnel traffic

---

## Quick Reference Commands

```bash
# Check git status
git status

# Add changes
git add .

# Commit changes
git commit -m "your commit message"

# Push to GitHub
git push

# View remote URL
git remote -v

# Switch branches
git checkout -b feature-name

# Merge to main
git checkout main
git merge feature-name
git push
```

## 🎉 You're Live!

Your Builder's Lab is now live at **https://thebuilderslab.pro**

Users can:
1. Browse free resources at `/resources`
2. Sign up after payment at `/signup`
3. Access full platform at `/dashboard`
4. Use all 7 AI-powered tools
5. Manage clients in CRM
6. Access implementation library

---

**Need Help?** Check Vercel docs at [vercel.com/docs](https://vercel.com/docs)
