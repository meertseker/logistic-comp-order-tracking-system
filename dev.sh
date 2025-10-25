#!/bin/bash

# Simple development script
echo "🔧 Building Electron..."
node scripts/watch-electron.js &
ELECTRON_PID=$!

echo "🚀 Starting Vite..."
npm run dev &
VITE_PID=$!

# Cleanup on exit
trap "kill $ELECTRON_PID $VITE_PID 2>/dev/null" EXIT

wait

