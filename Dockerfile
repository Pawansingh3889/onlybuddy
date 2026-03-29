# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM python:3.12-slim AS base

# Set working directory inside the container to the backend package
WORKDIR /app

# Install system dependencies required by psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code (includes entrypoint.sh)
COPY backend/ .
RUN chmod +x /app/entrypoint.sh

# ── Runtime ───────────────────────────────────────────────────────────────────
EXPOSE 5000

# entrypoint.sh runs:
#   python -m flask db upgrade
#   python scripts/seed_categories.py
#   python scripts/seed_qa.py
#   python scripts/seed_workers.py
# … then hands off to CMD, so Render's free tier (no Shell access)
# automatically initialises the DB on every deploy.
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "wsgi:app"]
