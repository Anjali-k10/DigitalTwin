"""
LifeTwin AI Engine - Prediction Routes
========================================
API endpoints for burnout prediction, productivity scoring,
and behavioural correlation analysis.
"""

import logging
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)

predictions_bp = Blueprint("predictions", __name__)


# ────────────────────────────────────────────────────────────────────────
# POST /api/predict/burnout
# ────────────────────────────────────────────────────────────────────────
@predictions_bp.route("/predict/burnout", methods=["POST"])
def predict_burnout():
    """
    Predict burnout risk based on daily behavioural metrics.

    Request JSON:
        {
            "hours_worked": float,
            "sleep_hours": float,
            "stress_level": int (1-10),
            "breaks_taken": int,
            "screen_time": float,
            "social_interactions": int
        }

    Response JSON:
        {
            "success": true,
            "data": {
                "risk_level": "high",
                "risk_score": 0.78,
                "confidence": 0.85,
                "contributing_factors": [...],
                "recommendations": [...]
            },
            "message": "Burnout risk prediction completed."
        }
    """
    try:
        payload = request.get_json(silent=True)
        if payload is None:
            return jsonify({
                "success": False,
                "data": None,
                "message": "Request body must be valid JSON.",
            }), 400

        # Validate input
        from app.utils.validators import validate_burnout_input
        is_valid, errors = validate_burnout_input(payload)
        if not is_valid:
            return jsonify({
                "success": False,
                "data": {"validation_errors": errors},
                "message": "Input validation failed.",
            }), 400

        # Run prediction
        from app.predictions.engine import PredictionEngine
        engine = PredictionEngine.get_instance()
        result = engine.predict_burnout(payload)

        return jsonify({
            "success": True,
            "data": result,
            "message": "Burnout risk prediction completed.",
        }), 200

    except Exception as exc:
        logger.exception("Burnout prediction failed: %s", str(exc))
        return jsonify({
            "success": False,
            "data": None,
            "message": f"Prediction error: {str(exc)}",
        }), 500


# ────────────────────────────────────────────────────────────────────────
# POST /api/predict/productivity
# ────────────────────────────────────────────────────────────────────────
@predictions_bp.route("/predict/productivity", methods=["POST"])
def predict_productivity():
    """
    Score and categorise productivity based on work metrics.

    Request JSON:
        {
            "tasks_completed": int,
            "focus_time_hours": float,
            "meetings_count": int,
            "deep_work_ratio": float (0-1),
            "interruptions": int
        }

    Response JSON:
        {
            "success": true,
            "data": {
                "productivity_score": 72,
                "category": "high",
                "breakdown": {...},
                "recommendations": [...]
            },
            "message": "Productivity prediction completed."
        }
    """
    try:
        payload = request.get_json(silent=True)
        if payload is None:
            return jsonify({
                "success": False,
                "data": None,
                "message": "Request body must be valid JSON.",
            }), 400

        # Validate input
        from app.utils.validators import validate_productivity_input
        is_valid, errors = validate_productivity_input(payload)
        if not is_valid:
            return jsonify({
                "success": False,
                "data": {"validation_errors": errors},
                "message": "Input validation failed.",
            }), 400

        # Run prediction
        from app.predictions.engine import PredictionEngine
        engine = PredictionEngine.get_instance()
        result = engine.predict_productivity(payload)

        return jsonify({
            "success": True,
            "data": result,
            "message": "Productivity prediction completed.",
        }), 200

    except Exception as exc:
        logger.exception("Productivity prediction failed: %s", str(exc))
        return jsonify({
            "success": False,
            "data": None,
            "message": f"Prediction error: {str(exc)}",
        }), 500


# ────────────────────────────────────────────────────────────────────────
# POST /api/analyze/correlation
# ────────────────────────────────────────────────────────────────────────
@predictions_bp.route("/analyze/correlation", methods=["POST"])
def analyze_correlation():
    """
    Analyse behavioural correlations across multiple observations.

    Request JSON:
        {
            "data": [
                {"hours_worked": 8, "sleep_hours": 7, ...},
                ...
            ]
        }

    At least 5 data-point dicts must be provided.

    Response JSON:
        {
            "success": true,
            "data": {
                "correlation_matrix": {...},
                "strong_correlations": [...],
                "insights": [...]
            },
            "message": "Correlation analysis completed."
        }
    """
    try:
        payload = request.get_json(silent=True)
        if payload is None:
            return jsonify({
                "success": False,
                "data": None,
                "message": "Request body must be valid JSON.",
            }), 400

        # Validate data presence
        data_points = payload.get("data")
        if not isinstance(data_points, list):
            return jsonify({
                "success": False,
                "data": {"validation_errors": ["'data' must be a list of observation dicts."]},
                "message": "Input validation failed.",
            }), 400

        if len(data_points) < 5:
            return jsonify({
                "success": False,
                "data": {"validation_errors": [
                    f"At least 5 data points are required, but only {len(data_points)} provided."
                ]},
                "message": "Input validation failed.",
            }), 400

        # Run correlation analysis
        from app.analytics.correlation import BehavioralCorrelation
        analyzer = BehavioralCorrelation()
        result = analyzer.analyze(data_points)

        return jsonify({
            "success": True,
            "data": result,
            "message": "Correlation analysis completed.",
        }), 200

    except Exception as exc:
        logger.exception("Correlation analysis failed: %s", str(exc))
        return jsonify({
            "success": False,
            "data": None,
            "message": f"Analysis error: {str(exc)}",
        }), 500
