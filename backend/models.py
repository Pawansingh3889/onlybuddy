from app import db
import datetime


def _utcnow():
    """Return current UTC time in a way that works on Python 3.11 and 3.12+."""
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


class Category(db.Model):
    """Errand / service category available on OnlyBuddy."""

    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    label = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(10), nullable=False)
    color = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text, nullable=True)
    example = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "label": self.label,
            "icon": self.icon,
            "color": self.color,
            "description": self.description,
            "example": self.example,
        }


class QAPost(db.Model):
    """Community question or frequently asked question."""

    __tablename__ = "qa_posts"

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category_slug = db.Column(db.String(50), db.ForeignKey("categories.slug"), nullable=True)
    author = db.Column(db.String(100), nullable=True)
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    is_pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=_utcnow)

    category = db.relationship("Category", backref="qa_posts", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "question": self.question,
            "answer": self.answer,
            "category_slug": self.category_slug,
            "author": self.author,
            "likes": self.likes,
            "views": self.views,
            "is_pinned": self.is_pinned,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Worker(db.Model):
    """Buddy / runner profile."""

    __tablename__ = "workers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    avatar = db.Column(db.String(10), nullable=True)
    rating = db.Column(db.Float, default=5.0)
    total_tasks = db.Column(db.Integer, default=0)
    zone = db.Column(db.String(50), nullable=True)
    eta_minutes = db.Column(db.Integer, default=10)
    badge = db.Column(db.String(50), nullable=True)
    online = db.Column(db.Boolean, default=False)
    vehicle_type = db.Column(db.String(50), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "avatar": self.avatar,
            "rating": self.rating,
            "total_tasks": self.total_tasks,
            "zone": self.zone,
            "eta_minutes": self.eta_minutes,
            "badge": self.badge,
            "online": self.online,
            "vehicle_type": self.vehicle_type,
            "bio": self.bio,
        }
