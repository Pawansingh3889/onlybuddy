#!/bin/sh
# entrypoint.sh — initialise the database then hand off to the main process.
# Runs every time the container starts so Render (free tier, no Shell access)
# automatically migrates and seeds the DB on each deploy.
set -e

echo "[entrypoint] Running database migrations..."
python -m flask db upgrade

echo "[entrypoint] Seeding categories..."
python scripts/seed_categories.py

echo "[entrypoint] Seeding Q&A..."
python scripts/seed_qa.py

echo "[entrypoint] Seeding workers..."
python scripts/seed_workers.py

echo "[entrypoint] Initialisation complete. Starting application..."
exec "$@"
