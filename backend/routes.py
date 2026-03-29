from flask import Blueprint, jsonify
from models import Category, QAPost, Worker

bp = Blueprint("api", __name__, url_prefix="/api")


@bp.get("/categories")
def list_categories():
    categories = Category.query.order_by(Category.id).all()
    return jsonify([c.to_dict() for c in categories])


@bp.get("/categories/<slug>")
def get_category(slug):
    category = Category.query.filter_by(slug=slug).first_or_404()
    return jsonify(category.to_dict())


@bp.get("/qa")
def list_qa():
    posts = QAPost.query.order_by(QAPost.is_pinned.desc(), QAPost.created_at.desc()).all()
    return jsonify([p.to_dict() for p in posts])


@bp.get("/qa/<int:post_id>")
def get_qa(post_id):
    post = QAPost.query.get_or_404(post_id)
    return jsonify(post.to_dict())


@bp.get("/workers")
def list_workers():
    workers = Worker.query.order_by(Worker.rating.desc()).all()
    return jsonify([w.to_dict() for w in workers])


@bp.get("/workers/<int:worker_id>")
def get_worker(worker_id):
    worker = Worker.query.get_or_404(worker_id)
    return jsonify(worker.to_dict())


@bp.get("/health")
def health():
    return jsonify({"status": "ok"})
