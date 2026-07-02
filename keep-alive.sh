#!/bin/bash
while true; do
  if ! pgrep -f "next dev" > /dev/null 2>&1; then
    echo "[$(date)] Server not running, starting..." >> /home/z/my-project/keep-alive.log
    cd /home/z/my-project && npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    sleep 5
  fi
  sleep 10
done
