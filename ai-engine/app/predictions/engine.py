"""Prediction Engine - Unified ML Model Orchestrator.

This module implements a singleton PredictionEngine that orchestrates all
machine learning models, providing a unified interface for burnout and
productivity predictions.
"""

import os
from app.models.burnout_model import BurnoutModel
from app.models.productivity_model import ProductivityModel


class PredictionEngine:
    """Singleton engine that orchestrates all ML prediction models.

    Provides a unified interface for accessing burnout and productivity
    predictions, managing model lifecycle, and reporting model status.

    Usage:
        engine = PredictionEngine.get_instance()
        result = engine.predict_burnout(data)

    Attributes:
        burnout_model (BurnoutModel): The burnout risk classifier.
        productivity_model (ProductivityModel): The productivity score regressor.
        models_loaded (dict): Tracks training status of each model.
    """

    _instance = None

    @classmethod
    def get_instance(cls):
        """Get or create the singleton PredictionEngine instance.

        Returns:
            The singleton PredictionEngine instance.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        """Initialize the PredictionEngine with all ML models.

        If the MODEL_AUTO_TRAIN environment variable is set to 'True',
        both models are trained immediately upon initialization.
        """
        self.burnout_model = BurnoutModel()
        self.productivity_model = ProductivityModel()

        self.models_loaded = {
            'burnout_model': False,
            'productivity_model': False,
        }

        # Auto-train models if configured
        auto_train = os.environ.get('MODEL_AUTO_TRAIN', 'True').lower() == 'true'
        if auto_train:
            self._train_all_models()

    def _train_all_models(self) -> None:
        """Train all models and update the models_loaded status tracker."""
        self.burnout_model.train()
        self.models_loaded['burnout_model'] = self.burnout_model.is_trained

        self.productivity_model.train()
        self.models_loaded['productivity_model'] = self.productivity_model.is_trained

    def predict_burnout(self, data: dict) -> dict:
        """Predict burnout risk for the given input data.

        Delegates to the BurnoutModel's predict method. The model will
        auto-train if not already trained.

        Args:
            data: Dictionary with burnout feature values.

        Returns:
            Dictionary with risk_level, risk_score, confidence,
            contributing_factors, and recommendations.
        """
        return self.burnout_model.predict(data)

    def predict_productivity(self, data: dict) -> dict:
        """Predict productivity score for the given input data.

        Delegates to the ProductivityModel's predict method. The model will
        auto-train if not already trained.

        Args:
            data: Dictionary with productivity feature values.

        Returns:
            Dictionary with productivity_score, category, breakdown,
            and recommendations.
        """
        return self.productivity_model.predict(data)

    def get_model_status(self) -> dict:
        """Return the current training status of all models.

        Returns:
            Dictionary mapping model names to their is_trained boolean status.
        """
        return {
            'burnout_model': {
                'is_trained': self.burnout_model.is_trained,
                'features': BurnoutModel.FEATURES,
            },
            'productivity_model': {
                'is_trained': self.productivity_model.is_trained,
                'features': ProductivityModel.FEATURES,
            },
        }

    def reload_models(self) -> None:
        """Re-initialize and re-train all models from scratch.

        Creates fresh model instances and trains them on newly generated
        synthetic data. Useful for resetting model state.
        """
        # Reset singleton awareness to allow fresh initialization
        self.burnout_model = BurnoutModel()
        self.productivity_model = ProductivityModel()

        self.models_loaded = {
            'burnout_model': False,
            'productivity_model': False,
        }

        self._train_all_models()
        print("[PredictionEngine] All models reloaded and retrained.")
