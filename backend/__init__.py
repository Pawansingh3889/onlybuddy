"""__init__.py — makes `backend` a Python package."""
from .app import create_app, db

__all__ = ["create_app", "db"]
