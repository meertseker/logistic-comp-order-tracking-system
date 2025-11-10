# Quick Start Guide - Sekersoft

Get started with Sekersoft in 5 minutes!

## Installation

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages and automatically rebuild native modules.

### Step 2: Start Development Mode

```bash
npm run electron:dev
```

The app will open automatically with hot-reload enabled.

## First Steps

### 1. Create Your First Order

1. Click the **"Yeni Sipariş"** (New Order) button
2. Fill in the form:
   - Plaka: `34 ABC 123`
   - Müşteri Adı: `Test Müşteri`
   - Telefon: `0532 123 45 67`
   - Nereden: `İstanbul`
   - Nereye: `Ankara`
   - Başlangıç Fiyatı: `5000`
3. Click **"Sipariş Oluştur"**

### 2. Add Expenses

1. In the order detail page, click **"Gider Ekle"**
2. Select expense type: `Yakıt`
3. Enter amount: `500`
4. Click **"Ekle"**

Watch the net income update automatically!

### 3. Upload an Invoice

1. Click **"Fatura Yükle"**
2. Select a PDF or image file
3. Click **"Yükle"**

### 4. Update Status

1. Click the edit icon (✏️) next to the status
2. Select new status: `Yolda`
3. Status updates immediately

### 5. View Reports

1. Go to **"Raporlar"** in the sidebar
2. Select current month
3. Click **"Rapor Oluştur"**
4. Export to CSV if needed

## Building for Production

### Create Mac Installer

```bash
npm run build:mac
```

The `.dmg` file will be in the `release` folder.

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Start development mode |
| `npm run build` | Build for production |
| `npm run build:mac` | Build Mac installer |
| `npm run rebuild` | Rebuild native modules |
| `npm run lint` | Check code quality |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate form fields |
| `Enter` | Submit forms |
| `Esc` | Close modals |

## Directory Structure

```
seymentransport/
├── src/                    # React app source
│   ├── components/        # UI components
│   ├── pages/            # Page views
│   └── utils/            # Helpers
├── electron/              # Electron source
│   ├── main/             # Main process
│   └── preload/          # Preload scripts
├── dist/                  # Built React app
├── dist-electron/         # Built Electron
└── release/              # Final installers
```

## Data Storage

Your data is stored locally at:

```
~/Library/Application Support/seymen-transport/
```

## Default Ports

- **Vite Dev Server**: http://localhost:5173
- **Electron**: Automatically connects to Vite

## Troubleshooting

### Port Already in Use

```bash
# Kill the process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules dist dist-electron
npm install
npm run rebuild
```

### Database Issues

```bash
# Reset database (WARNING: Deletes all data!)
rm -rf ~/Library/Application\ Support/seymen-transport/
```

## Next Steps

- Read [USAGE.md](USAGE.md) for detailed usage guide
- Check [README.md](README.md) for full documentation
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Getting Help

- **Issues**: Open an issue on GitHub
- **Email**: support@seymentransport.com
- **Docs**: See README.md and other guides

## Tips

✅ **Best Practices:**
- Create orders immediately after agreement
- Add expenses daily
- Upload all invoices
- Generate monthly reports
- Backup data weekly

🎯 **Pro Tips:**
- Use consistent plate number format
- Fill out all fields completely
- Use descriptive load descriptions
- Export reports for records

---

**Ready to go!** Start with `npm run electron:dev` and create your first order. 🚀

