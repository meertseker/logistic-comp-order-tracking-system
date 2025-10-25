# 🚀 START HERE - Seymen Transport

Welcome to your new Transportation Management System! This file will get you started in under 5 minutes.

## ✅ What You Have

A **complete, production-ready** offline desktop app for Mac with:

✅ Order management (create, track, update)  
✅ Expense tracking with auto-calculations  
✅ Invoice uploads (PDF/photos)  
✅ Status tracking (Bekliyor, Yolda, Teslim Edildi, etc.)  
✅ Monthly reports with CSV export  
✅ Beautiful, modern UI in Turkish  
✅ SQLite database (fully offline)  
✅ Comprehensive documentation  

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies

Open Terminal in this folder and run:

```bash
npm install
```

⏱️ This takes 2-3 minutes and automatically rebuilds native modules.

### Step 2: Start Development Mode

```bash
npm run electron:dev
```

⏱️ The app opens automatically in 10-15 seconds.

### Step 3: Create Your First Order

1. Click **"Yeni Sipariş"** (New Order)
2. Fill in the form with sample data
3. Click **"Sipariş Oluştur"**
4. Explore the order detail page!

**That's it! You're ready to use the app.**

## 📖 Documentation

Choose your path:

### 👤 For Users
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute guide  
- **[USAGE.md](USAGE.md)** - Complete user manual  
- **[INSTALL.md](INSTALL.md)** - Installation & deployment  

### 👨‍💻 For Developers
- **[README.md](README.md)** - Technical overview  
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guide  
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - What's been built  

## 🏗️ Build for Production

When ready to create a Mac installer:

```bash
npm run build:mac
```

Find the `.dmg` file in the `release/` folder.

## 📂 Project Structure (Simplified)

```
seymentransport/
├── src/              # React app (UI)
│   ├── components/  # Reusable UI parts
│   ├── pages/       # Main screens
│   └── utils/       # Helper functions
│
├── electron/         # Desktop app logic
│   ├── main/        # Backend + database
│   └── preload/     # Security bridge
│
├── package.json      # Dependencies
└── README.md         # Full docs
```

## 🎨 Key Features Demo

### 1. Dashboard
- See overview stats
- Recent orders
- Monthly summary

### 2. Create Order
- Plaka, customer, phone
- Route (from → to)
- Initial price

### 3. Track Expenses
- Add: Yakıt, HGS, Köprü, etc.
- Auto-calculate net income
- View history

### 4. Upload Invoices
- PDF or photos
- Organized by order
- Secure storage

### 5. Monthly Reports
- Earnings vs expenses
- Top vehicles
- Top customers
- Export to CSV

## 🛠️ Common Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Install everything |
| `npm run electron:dev` | Start dev mode |
| `npm run build:mac` | Create Mac installer |
| `npm run rebuild` | Fix native modules |

## 🆘 Troubleshooting

### Error: "Port 5173 already in use"
```bash
lsof -ti:5173 | xargs kill -9
npm run electron:dev
```

### Error: "better-sqlite3 not found"
```bash
npm run rebuild
```

### Error: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

## 📊 Tech Stack

Built with modern, proven technologies:

- **Electron** 33 - Desktop runtime  
- **React** 19 - UI framework  
- **TypeScript** 5.5 - Type safety  
- **SQLite** - Local database  
- **Tailwind CSS** - Styling  
- **Vite** - Fast builds  

## 🎯 Next Steps

1. ✅ Install: `npm install`
2. ✅ Run: `npm run electron:dev`
3. ✅ Create a test order
4. ✅ Add some expenses
5. ✅ Upload an invoice
6. ✅ Generate a report
7. ✅ Read [USAGE.md](USAGE.md) for details
8. ✅ Build for production: `npm run build:mac`

## 💡 Pro Tips

- **Data Location**: `~/Library/Application Support/seymen-transport/`
- **Backup**: Copy the folder above weekly
- **Support**: See README.md for contact info
- **Updates**: Pull latest code and `npm install`

## 🎓 Learning Path

New to this stack? Start here:

1. Try the app first (learn by using)
2. Read USAGE.md (understand features)
3. Explore src/pages/ (see how it works)
4. Read CONTRIBUTING.md (make changes)
5. Check electron/main/ (understand backend)

## ✨ What Makes This Special

✅ **Fully Offline** - No internet needed  
✅ **Secure** - Data stays on your Mac  
✅ **Fast** - SQLite + React performance  
✅ **Beautiful** - Modern, clean design  
✅ **Complete** - Ready to use today  
✅ **Documented** - Everything explained  
✅ **Extensible** - Easy to customize  

## 🏁 Ready to Start?

```bash
# Run these three commands:
npm install
npm run electron:dev
# App opens → Click "Yeni Sipariş" → You're live!
```

## 📞 Need Help?

- **Quick Questions**: See QUICKSTART.md
- **How to Use**: See USAGE.md  
- **Technical Issues**: See README.md
- **Email**: support@seymentransport.com

---

**You have everything you need to succeed! 🚀**

**Start with: `npm run electron:dev`**

---

**Questions? Check README.md first, then reach out!**

