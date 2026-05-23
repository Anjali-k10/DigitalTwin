"""Tests for LifeTwin AI Engine Prediction Endpoints.

This module contains integration tests for all prediction and analytics API
endpoints using pytest and Flask's test client. Tests cover success cases,
validation failures, and edge cases.
"""

import pytest
from app import create_app


@pytest.fixture
def app():
    """Create and configure a Flask application instance for testing."""
    app = create_app("testing")
    app.config['TESTING'] = True
    yield app


@pytest.fixture
def client(app):
    """Create a Flask test client for making requests."""
    return app.test_client()


class TestHealthEndpoint:
    """Tests for the /api/health endpoint."""

    def test_health_endpoint(self, client):
        """GET /api/health should return 200 with success=True."""
        response = client.get('/api/health')
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        assert json_data['data']['status'] == 'healthy'


class TestBurnoutPrediction:
    """Tests for the /api/predict/burnout endpoint."""

    def test_burnout_prediction(self, client):
        """POST /api/predict/burnout with valid data should return risk_level."""
        payload = {
            'hours_worked': 10,
            'sleep_hours': 5,
            'stress_level': 8,
            'breaks_taken': 1,
            'screen_time': 9,
            'social_interactions': 2,
        }
        response = client.post('/api/predict/burnout', json=payload)
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        data = json_data['data']
        assert 'risk_level' in data
        assert data['risk_level'] in ['low', 'medium', 'high', 'critical']
        assert 'risk_score' in data
        assert 'confidence' in data
        assert 'contributing_factors' in data
        assert 'recommendations' in data
        assert isinstance(data['recommendations'], list)

    def test_burnout_prediction_invalid(self, client):
        """POST /api/predict/burnout with missing fields should return 400."""
        payload = {
            'hours_worked': 8,
            # Missing other required fields
        }
        response = client.post('/api/predict/burnout', json=payload)
        assert response.status_code == 400
        json_data = response.get_json()
        assert json_data['success'] is False


class TestProductivityPrediction:
    """Tests for the /api/predict/productivity endpoint."""

    def test_productivity_prediction(self, client):
        """POST /api/predict/productivity with valid data should return productivity_score."""
        payload = {
            'tasks_completed': 12,
            'focus_time_hours': 5.5,
            'meetings_count': 3,
            'deep_work_ratio': 0.65,
            'interruptions': 4,
        }
        response = client.post('/api/predict/productivity', json=payload)
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        data = json_data['data']
        assert 'productivity_score' in data
        assert 'category' in data
        assert data['category'] in ['low', 'moderate', 'high', 'exceptional']
        assert 'breakdown' in data
        assert 'recommendations' in data
        assert isinstance(data['recommendations'], list)

    def test_productivity_prediction_invalid(self, client):
        """POST /api/predict/productivity with missing fields should return 400."""
        payload = {
            'tasks_completed': 10,
            # Missing other required fields
        }
        response = client.post('/api/predict/productivity', json=payload)
        assert response.status_code == 400
        json_data = response.get_json()
        assert json_data['success'] is False


class TestCorrelationAnalysis:
    """Tests for the /api/analyze/correlation endpoint."""

    def test_correlation_analysis(self, client):
        """POST /api/analyze/correlation with 10 data points should return correlation_matrix."""
        payload = {
            'data': [
                {'sleep_hours': 7, 'productivity_score': 75, 'stress_level': 3},
                {'sleep_hours': 5, 'productivity_score': 45, 'stress_level': 8},
                {'sleep_hours': 8, 'productivity_score': 85, 'stress_level': 2},
                {'sleep_hours': 6, 'productivity_score': 60, 'stress_level': 6},
                {'sleep_hours': 4, 'productivity_score': 35, 'stress_level': 9},
                {'sleep_hours': 7.5, 'productivity_score': 78, 'stress_level': 4},
                {'sleep_hours': 6.5, 'productivity_score': 65, 'stress_level': 5},
                {'sleep_hours': 8.5, 'productivity_score': 90, 'stress_level': 1},
                {'sleep_hours': 5.5, 'productivity_score': 50, 'stress_level': 7},
                {'sleep_hours': 9, 'productivity_score': 88, 'stress_level': 2},
            ]
        }
        response = client.post('/api/analyze/correlation', json=payload)
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['success'] is True
        data = json_data['data']
        assert 'correlation_matrix' in data
        assert 'strong_correlations' in data
        assert 'insights' in data
        assert isinstance(data['insights'], list)

    def test_correlation_insufficient_data(self, client):
        """POST /api/analyze/correlation with only 2 data points should return 400."""
        payload = {
            'data': [
                {'sleep_hours': 7, 'productivity_score': 75},
                {'sleep_hours': 5, 'productivity_score': 45},
            ]
        }
        response = client.post('/api/analyze/correlation', json=payload)
        assert response.status_code == 400
        json_data = response.get_json()
        assert json_data['success'] is False
