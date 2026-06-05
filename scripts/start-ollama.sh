#!/bin/bash
# Start Ollama server for HireMind AI
# This script starts the Ollama daemon and pulls the qwen2.5 model.
#
# Prerequisites:
# - Ollama must be installed: curl -fsSL https://ollama.com/install.sh | sh
# - Or downloaded from: https://ollama.com/download
#
# Usage:
#   chmod +x scripts/start-ollama.sh
#   ./scripts/start-ollama.sh

set -e

echo "🧠 HireMind AI — Ollama Startup Script"
echo "========================================"

# Check if ollama is installed
if ! command -v ollama &> /dev/null; then
    # Try the known path
    if [ -f "/home/z/.local/bin/ollama" ]; then
        export PATH="/home/z/.local/bin:$PATH"
    else
        echo "❌ Ollama is not installed."
        echo "   Install it with: curl -fsSL https://ollama.com/install.sh | sh"
        echo "   Or download from: https://ollama.com/download"
        exit 1
    fi
fi

# Set library path for the bundled libraries
export LD_LIBRARY_PATH="/home/z/.local/lib/ollama/lib/ollama:${LD_LIBRARY_PATH:-}"

# Set the host
export OLLAMA_HOST="0.0.0.0:11434"

echo "📍 Starting Ollama server on ${OLLAMA_HOST}..."

# Start ollama serve in the background
ollama serve &
OLLAMA_PID=$!

echo "⏳ Waiting for Ollama to be ready..."
sleep 5

# Check if the server is responding
MAX_RETRIES=10
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama server is running!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Ollama server failed to start. Check the logs above for errors."
    echo "   The llama-server may not be compatible with this environment."
    echo "   HireMind will use the z-ai-web-dev-sdk as fallback."
    exit 1
fi

# Pull the qwen2.5 model
echo ""
echo "📦 Pulling qwen2.5:0.5b model (lightweight, good for testing)..."
ollama pull qwen2.5:0.5b

echo ""
echo "🎉 Ollama is ready!"
echo "   Server: http://localhost:11434"
echo "   Model: qwen2.5:0.5b"
echo "   PID: $OLLAMA_PID"
echo ""
echo "To use Ollama as the HireMind provider, the engine will auto-detect it."
echo "If Ollama is not available, the engine falls back to z-ai-web-dev-sdk."
echo ""
echo "To stop Ollama: kill $OLLAMA_PID"

# Keep the script running
wait $OLLAMA_PID
