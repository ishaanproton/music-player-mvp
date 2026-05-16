
#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

echo "Starting Music Player MVP..."

# Start Backend
echo "Starting Backend on port 8000..."
cd api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r ../requirements.txt > /dev/null
python3 index.py &

# Wait a moment for backend to initialize
sleep 2

# Start Frontend
echo "Starting Frontend on port 5173..."
cd ..
npm install > /dev/null
npm run dev
