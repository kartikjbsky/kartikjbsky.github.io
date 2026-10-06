#!/usr/bin/env bash
set -e

PORT="${1:-8000}"

echo "Starting Kartik's portfolio..."
echo "Open: http://localhost:${PORT}"
echo "Press Ctrl+C to stop the server."

python3 run_server.py --port "$PORT"
