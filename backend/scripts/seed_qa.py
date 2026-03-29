"""seed_qa.py — populate the qa_posts table with common OnlyBuddy Q&A entries."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app, db
from models import QAPost

QA_ENTRIES = [
    {
        "question": "How do I place my first errand request?",
        "answer": (
            "Tap the errand type you need (e.g. Grocery Run), describe what you need, "
            "enter your Hull postcode, and set a budget. A nearby Buddy will accept and "
            "complete the task for you."
        ),
        "category_slug": "grocery",
        "author": "OnlyBuddy Team",
        "likes": 42,
        "views": 310,
        "is_pinned": True,
    },
    {
        "question": "How much does it cost to use OnlyBuddy?",
        "answer": (
            "Each errand has a flat service fee starting from £4.50 depending on the task "
            "type. You also set a budget for any shopping. There are no hidden charges."
        ),
        "category_slug": None,
        "author": "OnlyBuddy Team",
        "likes": 38,
        "views": 280,
        "is_pinned": True,
    },
    {
        "question": "Can a Buddy collect my NHS prescription?",
        "answer": (
            "Yes! Choose 'Prescription Run', provide your pharmacy name and address, and "
            "your Buddy will collect it and deliver it to your door. Please ensure the "
            "prescription is ready for collection before booking."
        ),
        "category_slug": "pharmacy",
        "author": "OnlyBuddy Team",
        "likes": 29,
        "views": 195,
        "is_pinned": False,
    },
    {
        "question": "What areas in Hull does OnlyBuddy cover?",
        "answer": (
            "We currently cover all HU postcodes (HU1–HU17). You can see which Buddies "
            "are available in your zone when placing an errand."
        ),
        "category_slug": None,
        "author": "OnlyBuddy Team",
        "likes": 21,
        "views": 162,
        "is_pinned": False,
    },
    {
        "question": "How do I track my errand in real time?",
        "answer": (
            "Once a Buddy accepts your task you will see a live tracking screen with "
            "step-by-step status updates. You can also chat directly with your Buddy "
            "through the in-app messenger."
        ),
        "category_slug": None,
        "author": "OnlyBuddy Team",
        "likes": 17,
        "views": 134,
        "is_pinned": False,
    },
    {
        "question": "Can I queue at the Post Office or council offices?",
        "answer": (
            "Absolutely. Select 'Queue for Me', describe where you need to queue and "
            "the purpose, and your Buddy will hold your spot and update you via chat."
        ),
        "category_slug": "queue",
        "author": "OnlyBuddy Team",
        "likes": 14,
        "views": 98,
        "is_pinned": False,
    },
    {
        "question": "How do I return a parcel with OnlyBuddy?",
        "answer": (
            "Choose 'Parcel & Returns', enter the drop-off location (e.g. Post Office, "
            "Evri ParcelShop), and your Buddy will collect the parcel from you and handle "
            "the return on your behalf."
        ),
        "category_slug": "parcel",
        "author": "OnlyBuddy Team",
        "likes": 11,
        "views": 87,
        "is_pinned": False,
    },
    {
        "question": "How do I apply to become a Buddy?",
        "answer": (
            "Visit the 'Become a Buddy' page, complete the multi-step application form, "
            "upload your ID and a selfie, and agree to the background check. Our team "
            "will review your application within 48 hours."
        ),
        "category_slug": None,
        "author": "OnlyBuddy Team",
        "likes": 33,
        "views": 241,
        "is_pinned": False,
    },
]


def seed():
    app = create_app()
    with app.app_context():
        added = 0
        for data in QA_ENTRIES:
            existing = QAPost.query.filter_by(question=data["question"]).first()
            if not existing:
                db.session.add(QAPost(**data))
                added += 1
        db.session.commit()
        print(f"[seed_qa] {added} Q&A entries added ({len(QA_ENTRIES) - added} already existed).")


if __name__ == "__main__":
    seed()
