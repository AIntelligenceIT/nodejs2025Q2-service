#!/bin/sh
set -e

echo "[entrypoint] Running migrations before starting the app"
if [ -f ./dist/scripts/run-migrations.js ]; then
  node ./dist/scripts/run-migrations.js
else
  echo "[entrypoint] No migrations script found in dist, skipping migrations"
fi

echo "[entrypoint] Starting application"
exec node dist/main
