"""Burnout Risk Prediction Model.

This module implements a Random Forest-based classifier for predicting employee
burnout risk. The model is pre-trained on synthetic data generated from realistic
behavioral patterns and provides risk assessments with actionable recommendations.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler


class BurnoutModel:
    """Random Forest classifier for burnout risk prediction.

    The model analyzes six behavioral features (work hours, sleep, stress,
    breaks, screen time, social interactions) to classify burnout risk and
    generate personalized recommendations.

    Attributes:
        FEATURES (list[str]): Names of the input features in expected order.
        model (RandomForestClassifier): The underlying classifier.
        scaler (StandardScaler): Feature scaler for normalization.
        is_trained (bool): Whether the model has been trained.
    """

    FEATURES = [
        'hours_worked',
        'sleep_hours',
        'stress_level',
        'breaks_taken',
        'screen_time',
        'social_interactions',
    ]

    def __init__(self):
        """Initialize the BurnoutModel with a RandomForestClassifier and StandardScaler."""
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False

    def _generate_synthetic_data(self, n_samples: int = 1000) -> tuple:
        """Generate realistic synthetic training data for burnout prediction.

        Creates a dataset with realistic distributions for each behavioral
        feature and derives burnout labels using a rule-based formula that
        captures common burnout patterns.

        Args:
            n_samples: Number of training samples to generate.

        Returns:
            A tuple of (X, y) where X is a DataFrame of features and y is a
            Series of binary burnout labels (0 = no burnout, 1 = burnout).
        """
        np.random.seed(42)

        hours_worked = np.clip(np.random.normal(8, 3, n_samples), 0, 20)
        sleep_hours = np.clip(np.random.normal(7, 1.5, n_samples), 3, 12)
        stress_level = np.random.randint(1, 11, n_samples)
        breaks_taken = np.random.randint(0, 9, n_samples)
        screen_time = np.clip(np.random.normal(6, 2, n_samples), 1, 16)
        social_interactions = np.random.randint(0, 11, n_samples)

        # Burnout labeling rules based on realistic patterns
        burnout = (
            ((hours_worked > 10) & (sleep_hours < 6) & (stress_level > 7))
            | ((hours_worked > 12) & (stress_level > 8))
            | ((sleep_hours < 5) & (stress_level > 6) & (social_interactions < 2))
        ).astype(int)

        X = pd.DataFrame({
            'hours_worked': hours_worked,
            'sleep_hours': sleep_hours,
            'stress_level': stress_level,
            'breaks_taken': breaks_taken,
            'screen_time': screen_time,
            'social_interactions': social_interactions,
        })

        y = pd.Series(burnout, name='burnout')

        return X, y

    def train(self) -> None:
        """Train the burnout model on synthetic data.

        Generates synthetic training data, fits the scaler and classifier,
        and prints the training accuracy. Sets is_trained to True upon
        completion.
        """
        X, y = self._generate_synthetic_data()

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True

        accuracy = self.model.score(X_scaled, y)
        print(f"[BurnoutModel] Training complete. Accuracy: {accuracy:.4f}")

    def predict(self, data: dict) -> dict:
        """Predict burnout risk for the given input data.

        Args:
            data: Dictionary containing values for all features in FEATURES.

        Returns:
            A dictionary with:
                - risk_level (str): 'low', 'medium', 'high', or 'critical'
                - risk_score (float): Probability of burnout (0.0 - 1.0)
                - confidence (float): Model confidence in the prediction
                - contributing_factors (list[dict]): Sorted list of factors with
                  their importance scores and input values
                - recommendations (list[str]): Actionable suggestions
        """
        if not self.is_trained:
            self.train()

        df = pd.DataFrame([data])[self.FEATURES]
        X_scaled = self.scaler.transform(df)

        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]

        # Burnout probability is the probability of class 1
        burnout_probability = float(probabilities[1]) if len(probabilities) > 1 else float(probabilities[0])

        # Determine risk level based on probability thresholds
        if burnout_probability < 0.3:
            risk_level = 'low'
        elif burnout_probability < 0.5:
            risk_level = 'medium'
        elif burnout_probability < 0.7:
            risk_level = 'high'
        else:
            risk_level = 'critical'

        # Extract and sort feature importances
        importances = self.model.feature_importances_
        feature_importance_pairs = sorted(
            zip(self.FEATURES, importances),
            key=lambda x: x[1],
            reverse=True,
        )

        contributing_factors = [
            {
                'factor': feature,
                'importance': round(float(importance), 4),
                'value': data.get(feature),
            }
            for feature, importance in feature_importance_pairs
        ]

        # Get top factors for recommendation generation
        top_factors = [f[0] for f in feature_importance_pairs[:3]]

        recommendations = self._generate_recommendations(risk_level, top_factors, data)

        confidence = float(max(probabilities))

        return {
            'risk_level': risk_level,
            'risk_score': round(burnout_probability, 4),
            'confidence': round(confidence, 4),
            'contributing_factors': contributing_factors,
            'recommendations': recommendations,
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
        self, risk_level: str, factors: list, data: dict
    ) -> list:
        """Generate context-aware recommendations based on prediction results.

        Produces actionable suggestions tailored to the user's specific risk
        level and the behavioral features contributing most to burnout risk.

        Args:
            risk_level: The predicted risk level ('low', 'medium', 'high', 'critical').
            factors: Top contributing feature names sorted by importance.
            data: The original input data dictionary.

        Returns:
            A list of recommendation strings.
        """
        recommendations = []

        # General risk-level recommendations
        if risk_level == 'critical':
            recommendations.append(
                'Immediate action recommended: Your burnout risk is critically high. '
                'Consider speaking with a manager or counselor.'
            )
        elif risk_level == 'high':
            recommendations.append(
                'Your burnout risk is elevated. Prioritize self-care and work-life balance.'
            )

        # Feature-specific recommendations
        hours_worked = data.get('hours_worked', 0)
        sleep_hours = data.get('sleep_hours', 8)
        stress_level = data.get('stress_level', 1)
        breaks_taken = data.get('breaks_taken', 4)
        screen_time = data.get('screen_time', 6)
        social_interactions = data.get('social_interactions', 5)

        if hours_worked > 9:
            recommendations.append(
                'Consider reducing daily work hours. '
                f'You are currently working {hours_worked:.1f} hours, which exceeds recommended limits.'
            )

        if sleep_hours < 7:
            recommendations.append(
                'Prioritize getting 7-8 hours of sleep. '
                f'Your current {sleep_hours:.1f} hours may be insufficient for recovery.'
            )

        if stress_level > 6:
            recommendations.append(
                'Your stress level is high. Consider mindfulness exercises, '
                'meditation, or professional stress management techniques.'
            )

        if breaks_taken < 3:
            recommendations.append(
                'Take more regular breaks throughout the day. '
                'Aim for at least 3-4 short breaks to maintain focus and reduce fatigue.'
            )

        if screen_time > 8:
            recommendations.append(
                f'Your screen time of {screen_time:.1f} hours is high. '
                'Schedule screen-free periods to reduce eye strain and mental fatigue.'
            )

        if social_interactions < 3:
            recommendations.append(
                'Increase social interactions. Connecting with colleagues and friends '
                'can significantly reduce burnout risk.'
            )

        # Ensure at least one recommendation
        if not recommendations:
            recommendations.append(
                'Your current habits look healthy. Keep maintaining a balanced routine!'
            )

        return recommendations
