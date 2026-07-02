#!/bin/bash
if ! pgrep -f "next-server" > /dev/null 2>&1; then
  echo "$(date): Server dead, restarting..." >> /home/z/my-project/restart.log
  pkill -f "next dev" 2>/dev/null
  cd /home/z/my-project
  npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
fi
