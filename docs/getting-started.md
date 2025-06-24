# Getting Started - Running the Game Review Aggregator

This document explains how to properly run the application with full Steam API access.

## Prerequisites

### Linux/WSL Users - Install Required Dependencies First

Before running the application, you must install the required system dependencies:

```bash
sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libsecret-1-0 libgbm1 libasound2
```

**Important:** The `libnss3` package is essential - without it, you'll get an error like "cannot open shared object file: libnss3.so". The `libgbm1` and `libasound2` packages are also required for proper Electron functionality.

## Quick Start

After installing prerequisites (Linux/WSL users), the simplest way to run the application:

```bash
npm run dev
```

This single command starts both the React development server AND the Electron desktop app.

## Important: This is a Desktop App!

This application is built with Electron and requires running as a desktop application to access Steam's API. Simply opening http://localhost:5173 in your browser will NOT give you full functionality.

When you run `npm run dev`, you'll see:
1. A browser tab open at http://localhost:5173 (ignore this - it's just the dev server)
2. **A separate desktop window** - THIS is where you should use the app

## What Happens When You Run `npm run dev`

The `npm run dev` command runs two processes:

1. **Vite Dev Server** (`npm run dev:react`)
   - Starts a development server on http://localhost:5173
   - Provides hot module reloading for React components
   - This is what serves the frontend code

2. **Electron App** (`npm run dev:electron`)
   - Waits for the Vite server to be ready
   - Launches a desktop application window
   - Provides access to Steam API and local file system
   - This is where you actually use the app

## Manual Method (if needed)

If the automatic method doesn't work, you can run the processes manually:

**Terminal 1:**
```bash
npm run dev:react
```
Wait until you see: `VITE v4.5.14 ready in XXX ms`

**Terminal 2:**
```bash
NODE_ENV=development npx electron .
```

## Troubleshooting

### "Please run the app using npm run dev" message
This appears when you're using the browser tab instead of the Electron window. Make sure you're using the desktop application window, not your web browser.

### No Electron window appears (WSL/Linux users)
1. **First, make sure you installed the required dependencies** (see Prerequisites section above)

2. Ensure you have a display server running:
   - WSL2 users: WSLg should handle this automatically on Windows 11
   - Linux users: Make sure X11 is running
   
3. Check your DISPLAY variable:
   ```bash
   echo $DISPLAY
   ```
   Should output something like `:0` or `:0.0`

### White/blank Electron window
This means Electron launched but can't connect to the Vite server. Make sure:
1. The Vite dev server is running (check Terminal 1)
2. No other process is using port 5173
3. Your firewall isn't blocking localhost connections

### D-Bus errors
Errors like "Failed to connect to the bus" are normal on WSL and won't affect the app's functionality. You can safely ignore these.

## Production Build

To build and run the production version:

```bash
npm run build:electron
```

This creates a standalone desktop application in the `dist` folder.