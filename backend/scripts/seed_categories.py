"""seed_categories.py — populate the categories table with OnlyBuddy errand types."""

import sys
import os

# Allow running as `python scripts/seed_categories.py` from the backend/ dir
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app, db
from models import Category

CATEGORIES = [
    {
        "slug": "grocery",
        "label": "Grocery Run",
        "icon": "🛒",
        "color": "#059669",
        "description": "Any supermarket or local shop in Hull",
        "example": "e.g. Tesco Express, Heron Foods, Iceland",
    },
    {
        "slug": "buy",
        "label": "Buy & Deliver",
        "icon": "🛍️",
        "color": "#7C3AED",
        "description": "Send a Buddy to any shop for anything",
        "example": "e.g. Argos, Primark, local market",
    },
    {
        "slug": "queue",
        "label": "Queue for Me",
        "icon": "⏳",
        "color": "#D97706",
        "description": "Hold your spot in any queue in Hull",
        "example": "e.g. Post Office, council, NHS walk-in",
    },
    {
        "slug": "parcel",
        "label": "Parcel & Returns",
        "icon": "📦",
        "color": "#2563EB",
        "description": "Collect or drop off parcels anywhere",
        "example": "e.g. ASOS return, Amazon pickup",
    },
    {
        "slug": "pharmacy",
        "label": "Prescription Run",
        "icon": "💊",
        "color": "#DB2777",
        "description": "Collect NHS or private prescriptions",
        "example": "e.g. Boots Hull, Day Lewis Pharmacy",
    },
]


def seed():
    app = create_app()
    with app.app_context():
        added = 0
        for data in CATEGORIES:
            if not Category.query.filter_by(slug=data["slug"]).first():
                db.session.add(Category(**data))
                added += 1
        db.session.commit()
        print(f"[seed_categories] {added} categories added ({len(CATEGORIES) - added} already existed).")


if __name__ == "__main__":
    seed()
