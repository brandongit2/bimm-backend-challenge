#!/bin/sh

# Start inotify in the background; install packages when package.json changes
inotifywait -m -e modify /app/package.json | while read path action file; do
  echo "Detected package.json changes. Installing packages..."
  pnpm install
  echo "Done."
done &

# Start Node.js application
pnpm tsx watch src/index.ts
