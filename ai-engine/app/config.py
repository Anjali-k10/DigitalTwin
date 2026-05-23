"""
LifeTwin AI Engine - Configuration
====================================
Application configuration classes for different environments.
"""

import os


class BaseConfig:
    """Base configuration shared across all environments."""

    SECRET_KEY = os.getenv("SECRET_KEY", "lifetwin-ai-default-secret-key")
    DEBUG = False
    JSON_SORT_KEYS = False


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""

    DEBUG = True
    TESTING = False


class ProductionConfig(BaseConfig):
    """Production environment configuration."""

    DEBUG = False


class TestingConfig(BaseConfig):
    """Testing environment configuration."""

    TESTING = True
    DEBUG = True


# ── Environment ➜ Config class mapping ──────────────────────────────────
config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
