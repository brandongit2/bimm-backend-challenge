#!/bin/sh

# Start inotify in the background; install packages when package.json changes
inotifywait -m -e modify /app/package.json | while read path action file; do
  pnpm install
done &

# Start Node.js application
pnpm tsx watch src/server.ts
