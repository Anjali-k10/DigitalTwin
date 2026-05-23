"""
LifeTwin AI Engine - Application Factory
=========================================
Creates and configures the Flask application using the app factory pattern.
"""

import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

from app.config import config_by_name

# Configure module-level logger
logger = logging.getLogger(__name__)


def create_app(config_name="development"):
    """
    Application factory for the LifeTwin AI Engine.

    Args:
        config_name: Configuration environment name.
                     One of 'development', 'production', 'testing'.

    Returns:
        Configured Flask application instance.
    """
    app = Flask(__name__)

    # ── Load configuration ──────────────────────────────────────────────
    config_class = config_by_name.get(config_name, config_by_name["development"])
    app.config.from_object(config_class)

    # ── Configure logging ───────────────────────────────────────────────
    log_level = logging.DEBUG if app.config.get("DEBUG") else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # ── Initialize extensions ───────────────────────────────────────────
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Register blueprints ─────────────────────────────────────────────
    from app.routes.health import health_bp
    from app.routes.predictions import predictions_bp

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(predictions_bp, url_prefix="/api")

    # ── Before-request hook ─────────────────────────────────────────────
    @app.before_request
    def log_request_info():
        """Log incoming request method and path."""
        logger.info("%s %s", request.method, request.path)

    # ── Error handlers ──────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors."""
        return jsonify({
            "success": False,
            "data": None,
            "message": f"Resource not found: {request.path}",
        }), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 Internal Server errors."""
        logger.error("Internal server error: %s", str(error))
        return jsonify({
            "success": False,
            "data": None,
            "message": "An internal server error occurred.",
        }), 500

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        """Catch-all handler for unhandled exceptions."""
        logger.exception("Unhandled exception: %s", str(error))
        return jsonify({
            "success": False,
            "data": None,
            "message": f"Unexpected error: {str(error)}",
        }), 500

    # ── Lazy-load the prediction engine on first startup ────────────────
    with app.app_context():
        try:
            from app.predictions.engine import PredictionEngine
            engine = PredictionEngine.get_instance()
            logger.info(
                "PredictionEngine initialised — models loaded: %s",
                engine.get_model_status(),
            )
        except Exception as exc:
            logger.warning(
                "PredictionEngine lazy-load deferred — will initialise on first request: %s",
                str(exc),
            )

    logger.info("LifeTwin AI Engine created [env=%s]", config_name)
    return app
