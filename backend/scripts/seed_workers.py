"""seed_workers.py — populate the workers table with initial Buddy profiles."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app, db
from models import Worker

WORKERS = [
    {
        "name": "Callum H.",
        "avatar": "🧑‍🦱",
        "rating": 4.97,
        "total_tasks": 842,
        "zone": "HU5 / HU3",
        "eta_minutes": 4,
        "badge": "TOP BUDDY",
        "online": True,
        "vehicle_type": "Bicycle",
        "bio": "Fast, reliable, and always on time. Hull born and bred — I know every shortcut.",
    },
    {
        "name": "Priya S.",
        "avatar": "👩",
        "rating": 4.95,
        "total_tasks": 614,
        "zone": "HU1 / HU2",
        "eta_minutes": 7,
        "badge": None,
        "online": True,
        "vehicle_type": "Car",
        "bio": "City centre specialist. Happy to queue, shop, or run prescriptions.",
    },
    {
        "name": "Marcus D.",
        "avatar": "🧔",
        "rating": 4.88,
        "total_tasks": 389,
        "zone": "HU6 / HU8",
        "eta_minutes": 11,
        "badge": None,
        "online": True,
        "vehicle_type": "Motorbike",
        "bio": "East Hull coverage. Quick on the bike — parcels and pharmacy runs my speciality.",
    },
    {
        "name": "Aisha T.",
        "avatar": "👩‍🦱",
        "rating": 4.91,
        "total_tasks": 201,
        "zone": "HU4 / HU5",
        "eta_minutes": 8,
        "badge": None,
        "online": False,
        "vehicle_type": "Car",
        "bio": "West Hull and Hessle Road area. Great with grocery runs and returns.",
    },
]


def seed():
    app = create_app()
    with app.app_context():
        added = 0
        for data in WORKERS:
            if not Worker.query.filter_by(name=data["name"]).first():
                db.session.add(Worker(**data))
                added += 1
        db.session.commit()
        print(f"[seed_workers] {added} workers added ({len(WORKERS) - added} already existed).")


if __name__ == "__main__":
    seed()
