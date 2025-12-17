#!/bin/bash

echo "Starting ONETWO - Backend + Frontend"
echo "====================================="

pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo "Starting backend (port 3001)..."
NODE_ENV=development tsx server/index.ts &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 2

echo "Starting frontend (port 5000)..."
vite --host 0.0.0.0 --port 5000

kill $BACKEND_PID 2>/dev/null || true
