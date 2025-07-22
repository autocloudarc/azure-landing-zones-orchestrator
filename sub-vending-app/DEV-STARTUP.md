# Development Server Startup Guide

## 🚀 Quick Start - Multiple Options

### Option 1: NPM Script (Recommended)
```bash
npm run start:both
```
or
```bash
npm run start:dev
```

### Option 2: PowerShell Script
```powershell
.\start-dev.ps1
```

### Option 3: Batch File (Windows)
```cmd
start-dev.bat
```

### Option 4: Manual Startup (Separate Terminals)
```bash
# Terminal 1 - API Server
cd api
npm run dev

# Terminal 2 - Frontend Server  
npm run dev
```

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend only (Vite dev server) |
| `npm run api` | Start backend only (Express.js API) |
| `npm run start:both` | Start both frontend and backend concurrently |
| `npm run start:dev` | Same as start:both (alternative name) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🌐 Server URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🛠️ Troubleshooting

### Port Already in Use
If you get port errors:
```bash
# Kill processes on specific ports
netstat -ano | findstr :5173
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

### Dependencies Missing
```bash
# Install all dependencies
npm install
cd api && npm install
```

### Environment Variables
Ensure `.env` files exist in both root and `api/` directories with required database configuration.

## 🔄 Development Workflow

1. **First Time Setup**:
   ```bash
   npm install
   cd api && npm install
   cd ..
   ```

2. **Daily Development**:
   ```bash
   npm run start:both
   ```

3. **Frontend Only** (when API is already running):
   ```bash
   npm run dev
   ```

4. **Backend Only** (when frontend is already running):
   ```bash
   npm run api
   ```

## 📝 Notes

- Both servers support hot reload/auto-restart
- Frontend changes reflect immediately in browser
- Backend changes restart the Express server automatically
- Use Ctrl+C to stop all servers
