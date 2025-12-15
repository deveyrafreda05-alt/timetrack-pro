# TimeTrack Pro - Employee Time Tracking System

A professional, free time tracking system for small companies with cloud storage and secure authentication.

## 🚀 Features

- ✅ Employee clock in/out with automatic timestamp
- ✅ Admin dashboard with real-time monitoring
- ✅ Secure user authentication
- ✅ Cloud database storage (data never disappears)
- ✅ Employee time reports with filters (Today, Week, Month, Year)
- ✅ Mobile and desktop friendly
- ✅ 100% FREE hosting and database

## 📁 Project Structure

```
timetrack-pro/
├── package.json          # Node.js dependencies
├── server.js            # Backend API server
├── vercel.json          # Vercel deployment config
├── public/
│   └── index.html       # Frontend application
└── README.md           # This file
```

## 🛠️ Quick Start Guide

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `timetrack-pro`
3. Select "Public"
4. Click "Create repository"

### Step 2: Upload Files

Create these files in your repository (click "Add file" → "Create new file"):

1. **package.json** - Copy the code I provided
2. **server.js** - Copy the backend code
3. **vercel.json** - Copy the config file
4. **public/index.html** - Copy the frontend HTML

### Step 3: Set Up MongoDB (Database)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for FREE account
3. Create a cluster:
   - Choose M0 FREE tier
   - Select AWS - Singapore region
   - Click "Create"
4. Create database user:
   - Go to "Database Access"
   - Add new user with username and password
   - Save the password!
5. Allow network access:
   - Go to "Network Access"
   - Add IP: 0.0.0.0/0 (allow all)
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - **SAVE THIS STRING!**

### Step 4: Deploy to Vercel

1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "New Project"
4. Import your `timetrack-pro` repository
5. **IMPORTANT:** Add environment variable:
   - Name: `MONGODB_URI`
   - Value: [Paste your MongoDB connection string]
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your site is live! 🎉

### Step 5: Create Admin Account

1. Visit your Vercel URL (e.g., `yourapp.vercel.app`)
2. Click "Sign Up"
3. Fill in your information
4. After signup, you need to make yourself admin:
   - Go to MongoDB Atlas
   - Click "Browse Collections"
   - Find your user in `users` collection
   - Edit document and add: `"isAdmin": true`
   - Save

## 👥 Usage

### For Admin/Employer:
1. Log in with your credentials
2. You'll see the dashboard automatically
3. View all employee time records
4. Click on employee names to see detailed reports
5. Filter by time period (Today, Week, Month, Year)

### For Employees:
1. Log in with their credentials
2. First login = Clock In
3. Second login = Clock Out
4. Returns to welcome page after each action

## 🔒 Security Features

- Encrypted passwords (bcrypt)
- JWT authentication tokens
- HTTPS (automatic via Vercel)
- Protected admin routes
- Secure database connection

## 💾 Data Storage

- All data stored in MongoDB Atlas cloud
- Automatic backups by MongoDB
- Data persists forever (within free tier limits)
- Accessible from any device

## 💰 Cost

**100% FREE**
- MongoDB: 512MB storage (FREE forever)
- Vercel: Unlimited deployments (FREE forever)
- GitHub: Public repositories (FREE forever)
- **Total: $0/month**

## 📊 Free Tier Limits

- MongoDB M0: 512MB storage (~500,000 time entries)
- Vercel Hobby: 100GB bandwidth/month
- No expiration - FREE forever!

## 🔄 Updating Your App

To make changes:
1. Edit files directly in GitHub
2. Vercel automatically deploys changes
3. Updates live in ~30 seconds

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check MongoDB connection string in Vercel environment variables
- Verify network access is set to 0.0.0.0/0 in MongoDB

### "Login failed"
- Check if MongoDB cluster is active
- Verify user credentials are correct

### "Access denied" for dashboard
- Make sure `isAdmin: true` is set in MongoDB for your user

## 📱 Access

Share your Vercel URL with employees:
- Desktop: Any web browser
- Mobile: Any mobile browser
- Tablet: Any tablet browser

## 🔐 Default Test Account (Optional)

After deployment, you can create a test employee:
- Username: test_employee
- Password: employee123
- Not an admin (regular employee)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify MongoDB connection
3. Check browser console for errors

## ⚡ Performance

- Fast loading (hosted on Vercel's CDN)
- Real-time updates
- Works offline (after initial load)
- Mobile optimized

## 🎯 Next Steps After Deployment

1. ✅ Test admin login
2. ✅ Create test employee account
3. ✅ Test clock in/out functionality
4. ✅ Share URL with your team
5. ✅ Monitor employee attendance

---

**Made with ❤️ for small businesses**

Need help? Check the deployment guide for step-by-step screenshots!
