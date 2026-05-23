"""
LifeTwin AI Engine - Health Check Route
========================================
Provides a health-check endpoint that reports server status,
uptime, version, environment, and model readiness.
"""

import os
import time
import logging
from datetime import datetime, timezone

from flask import Blueprint, jsonify

logger = logging.getLogger(__name__)

health_bp = Blueprint("health", __name__)

# Record the server start time when this module is first imported
_server_start_time = time.time()


@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    GET /api/health

    Returns the current health status of the AI Engine including
    version, uptime, environment, timestamp, and loaded models.

    Response:
        {
            "success": true,
            "data": {
                "status": "healthy",
                "version": "1.0.0",
                "uptime_seconds": 123.45,
                "uptime_human": "0h 2m 3s",
                "environment": "development",
                "timestamp": "2026-05-23T01:52:21+00:00",
                "models_loaded": {
                    "burnout_predictor": false,
                    "productivity_predictor": false
                }
            },
            "message": "LifeTwin AI Engine is running."
        }
    """
    try:
        uptime_seconds = round(time.time() - _server_start_time, 2)
        hours, remainder = divmod(int(uptime_seconds), 3600)
        minutes, seconds = divmod(remainder, 60)
        uptime_human = f"{hours}h {minutes}m {seconds}s"

        # Attempt to read model status from the prediction engine
        models_loaded = {
            "burnout_predictor": False,
            "productivity_predictor": False,
        }
        try:
            from app.predictions.engine import PredictionEngine
            engine = PredictionEngine.get_instance()
            models_loaded = engine.get_model_status()
        except Exception:
            logger.debug("PredictionEngine not yet available for health check.")

        data = {
            "status": "healthy",
            "version": "1.0.0",
            "uptime_seconds": uptime_seconds,
            "uptime_human": uptime_human,
            "environment": os.getenv("FLASK_ENV", "development"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "models_loaded": models_loaded,
        }

        return jsonify({
            "success": True,
            "data": data,
            "message": "LifeTwin AI Engine is running.",
        }), 200

    except Exception as exc:
        logger.exception("Health check failed: %s", str(exc))
        return jsonify({
            "success": False,
            "data": None,
            "message": f"Health check error: {str(exc)}",
        }), 500
