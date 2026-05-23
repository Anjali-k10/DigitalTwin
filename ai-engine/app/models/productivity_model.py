"""Productivity Score Prediction Model.

This module implements a Gradient Boosting-based regressor for predicting
employee productivity scores. The model is pre-trained on synthetic data and
provides detailed score breakdowns with actionable recommendations.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler


class ProductivityModel:
    """Gradient Boosting regressor for productivity score prediction.

    The model analyzes five productivity features (tasks completed, focus time,
    meeting count, deep work ratio, interruptions) to predict an overall
    productivity score and generate per-dimension breakdowns.

    Attributes:
        FEATURES (list[str]): Names of the input features in expected order.
        model (GradientBoostingRegressor): The underlying regressor.
        scaler (StandardScaler): Feature scaler for normalization.
        is_trained (bool): Whether the model has been trained.
    """

    FEATURES = [
        'tasks_completed',
        'focus_time_hours',
        'meetings_count',
        'deep_work_ratio',
        'interruptions',
    ]

    def __init__(self):
        """Initialize the ProductivityModel with a GradientBoostingRegressor and StandardScaler."""
        self.model = GradientBoostingRegressor(
            n_estimators=100, max_depth=5, random_state=42
        )
        self.scaler = StandardScaler()
        self.is_trained = False

    def _generate_synthetic_data(self, n_samples: int = 1000) -> tuple:
        """Generate realistic synthetic training data for productivity prediction.

        Creates a dataset with realistic distributions for each productivity
        feature and derives scores using a weighted formula that captures
        realistic productivity patterns.

        Args:
            n_samples: Number of training samples to generate.

        Returns:
            A tuple of (X, y) where X is a DataFrame of features and y is a
            Series of productivity scores (0-100).
        """
        np.random.seed(42)

        tasks_completed = np.random.randint(0, 21, n_samples)
        focus_time_hours = np.clip(np.random.normal(4, 2, n_samples), 0, 12)
        meetings_count = np.random.randint(0, 11, n_samples)
        deep_work_ratio = np.random.uniform(0, 1, n_samples)
        interruptions = np.random.randint(0, 21, n_samples)

        # Productivity score formula with noise
        noise = np.random.normal(0, 5, n_samples)
        score = (
            (tasks_completed * 4)
            + (focus_time_hours * 8)
            - (meetings_count * 3)
            + (deep_work_ratio * 25)
            - (interruptions * 2)
            + noise
        )
        score = np.clip(score, 0, 100)

        X = pd.DataFrame({
            'tasks_completed': tasks_completed,
            'focus_time_hours': focus_time_hours,
            'meetings_count': meetings_count,
            'deep_work_ratio': deep_work_ratio,
            'interruptions': interruptions,
        })

        y = pd.Series(score, name='productivity_score')

        return X, y

    def train(self) -> None:
        """Train the productivity model on synthetic data.

        Generates synthetic training data, fits the scaler and regressor,
        and prints the training R² score. Sets is_trained to True upon
        completion.
        """
        X, y = self._generate_synthetic_data()

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True

        r2_score = self.model.score(X_scaled, y)
        print(f"[ProductivityModel] Training complete. R² Score: {r2_score:.4f}")

    def predict(self, data: dict) -> dict:
        """Predict productivity score for the given input data.

        Args:
            data: Dictionary containing values for all features in FEATURES.

        Returns:
            A dictionary with:
                - productivity_score (float): Overall score (0-100)
                - category (str): 'low', 'moderate', 'high', or 'exceptional'
                - breakdown (dict): Per-dimension contribution scores
                - recommendations (list[str]): Actionable suggestions
        """
        if not self.is_trained:
            self.train()

        df = pd.DataFrame([data])[self.FEATURES]
        X_scaled = self.scaler.transform(df)

        raw_score = self.model.predict(X_scaled)[0]
        productivity_score = float(np.clip(raw_score, 0, 100))

        # Categorize the score
        if productivity_score < 30:
            category = 'low'
        elif productivity_score < 50:
            category = 'moderate'
        elif productivity_score < 75:
            category = 'high'
        else:
            category = 'exceptional'

        # Calculate per-dimension breakdown showing each feature's contribution
        breakdown = self._calculate_breakdown(data)

        recommendations = self._generate_recommendations(
            productivity_score, category, data
        )

        return {
            'productivity_score': round(productivity_score, 2),
            'category': category,
            'breakdown': breakdown,
            'recommendations': recommendations,
        }

    def _calculate_breakdown(self, data: dict) -> dict:
        """Calculate per-dimension contribution scores.

        Uses the known scoring formula weights to estimate each feature's
        contribution to the overall productivity score.

        Args:
            data: The original input data dictionary.

        Returns:
            Dictionary mapping dimension names to their contribution scores.
        """
        tasks_score = min(data.get('tasks_completed', 0) * 4, 80)
        focus_score = min(data.get('focus_time_hours', 0) * 8, 96)
        meetings_penalty = data.get('meetings_count', 0) * 3
        deep_work_score = data.get('deep_work_ratio', 0) * 25
        interruption_penalty = data.get('interruptions', 0) * 2

        return {
            'task_completion': round(float(tasks_score), 2),
            'focus_quality': round(float(focus_score), 2),
            'meeting_overhead': round(float(-meetings_penalty), 2),
            'deep_work': round(float(deep_work_score), 2),
            'interruption_cost': round(float(-interruption_penalty), 2),
        }

    def get_feature_importance(self) -> dict:
        """Return a sorted dictionary of feature importances.

        Returns:
            Dictionary mapping feature names to their importance scores,
            sorted in descending order of importance.

        Raises:
            RuntimeError: If the model has not been trained yet.
        """
        if not self.is_trained:
            self.train()

        importances = self.model.feature_importances_
        importance_dict = dict(
            sorted(
                zip(self.FEATURES, importances),
                key=lambda x: x[1],
                reverse=True,
            )
        )
        return {k: round(float(v), 4) for k, v in importance_dict.items()}

    def _generate_recommendations(
        self, score: float, category: str, data: dict
    ) -> list:
        """Generate context-aware recommendations based on prediction results.

        Produces actionable suggestions tailored to the user's productivity
        score, category, and individual feature values.

        Args:
            score: The predicted productivity score (0-100).
            category: The productivity category ('low', 'moderate', 'high', 'exceptional').
            data: The original input data dictionary.

        Returns:
            A list of recommendation strings.
        """
        recommendations = []

        # General category-level recommendations
        if category == 'low':
            recommendations.append(
                'Your productivity score is low. Consider restructuring your '
                'daily workflow to prioritize high-impact tasks.'
            )
        elif category == 'moderate':
            recommendations.append(
                'Your productivity is moderate. Small improvements in focus time '
                'or task management could yield significant gains.'
            )

        # Feature-specific recommendations
        tasks_completed = data.get('tasks_completed', 0)
        focus_time_hours = data.get('focus_time_hours', 0)
        meetings_count = data.get('meetings_count', 0)
        deep_work_ratio = data.get('deep_work_ratio', 0)
        interruptions = data.get('interruptions', 0)

        if deep_work_ratio < 0.4:
            recommendations.append(
                f'Try to increase your deep work ratio (currently {deep_work_ratio:.2f}). '
                'Block dedicated time slots for focused, uninterrupted work.'
            )

        if meetings_count > 5:
            recommendations.append(
                f'Reduce meeting load ({meetings_count} meetings detected). '
                'Consider declining non-essential meetings or switching to async updates.'
            )

        if focus_time_hours < 3:
            recommendations.append(
                f'Your focus time ({focus_time_hours:.1f}h) is below optimal. '
                'Aim for at least 4 hours of focused work per day.'
            )

        if interruptions > 10:
            recommendations.append(
                f'High interruption count ({interruptions}). Use "Do Not Disturb" modes '
                'and batch communication to reduce context-switching costs.'
            )

        if tasks_completed < 5:
            recommendations.append(
                'Task completion is low. Break larger tasks into smaller, '
                'achievable subtasks to build momentum.'
            )

        # Positive reinforcement for high performers
        if category == 'exceptional':
            recommendations.append(
                'Excellent productivity! Maintain your current habits and consider '
                'mentoring teammates to share your workflow strategies.'
            )
        elif category == 'high':
            recommendations.append(
                'Great productivity level. Fine-tune your workflow to reach '
                'exceptional performance.'
            )

        if not recommendations:
            recommendations.append(
                'Your productivity is on track. Keep up the good work!'
            )

        return recommendations
