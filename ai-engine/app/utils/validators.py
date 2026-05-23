"""Input Validation Functions.

This module provides validation functions for all prediction and analytics
endpoints. Each validator checks for required fields, correct types, and
valid value ranges, returning a tuple of (is_valid, error_message).
"""


def validate_burnout_input(data: dict) -> tuple:
    """Validate input data for burnout risk prediction.

    Checks that all required fields are present, have numeric types,
    and fall within physiologically plausible ranges.

    Args:
        data: Dictionary of burnout feature values to validate.

    Returns:
        A tuple of (is_valid, error_message) where is_valid is True and
        error_message is None on success, or is_valid is False and
        error_message describes the validation failure.
    """
    if data is None:
        return False, 'Input data cannot be None'

    required_fields = [
        'hours_worked',
        'sleep_hours',
        'stress_level',
        'breaks_taken',
        'screen_time',
        'social_interactions',
    ]

    # Check for missing fields
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}'

    # Check all fields are numeric
    for field in required_fields:
        value = data[field]
        if not isinstance(value, (int, float)):
            return False, f'Field "{field}" must be numeric, got {type(value).__name__}'

    # Range checks
    range_checks = {
        'hours_worked': (0, 24),
        'sleep_hours': (0, 24),
        'stress_level': (1, 10),
        'breaks_taken': (0, 20),
        'screen_time': (0, 24),
        'social_interactions': (0, 50),
    }

    for field, (min_val, max_val) in range_checks.items():
        value = data[field]
        if value < min_val or value > max_val:
            return False, (
                f'Field "{field}" value {value} is out of range '
                f'[{min_val}, {max_val}]'
            )

    return True, None


def validate_productivity_input(data: dict) -> tuple:
    """Validate input data for productivity score prediction.

    Checks that all required fields are present, have numeric types,
    and fall within valid operational ranges.

    Args:
        data: Dictionary of productivity feature values to validate.

    Returns:
        A tuple of (is_valid, error_message) where is_valid is True and
        error_message is None on success, or is_valid is False and
        error_message describes the validation failure.
    """
    if data is None:
        return False, 'Input data cannot be None'

    required_fields = [
        'tasks_completed',
        'focus_time_hours',
        'meetings_count',
        'deep_work_ratio',
        'interruptions',
    ]

    # Check for missing fields
    for field in required_fields:
        if field not in data:
            return False, f'Missing required field: {field}'

    # Check all fields are numeric
    for field in required_fields:
        value = data[field]
        if not isinstance(value, (int, float)):
            return False, f'Field "{field}" must be numeric, got {type(value).__name__}'

    # Range checks
    range_checks = {
        'tasks_completed': (0, 100),
        'focus_time_hours': (0, 24),
        'meetings_count': (0, 20),
        'deep_work_ratio': (0, 1),
        'interruptions': (0, 50),
    }

    for field, (min_val, max_val) in range_checks.items():
        value = data[field]
        if value < min_val or value > max_val:
            return False, (
                f'Field "{field}" value {value} is out of range '
                f'[{min_val}, {max_val}]'
            )

    return True, None


def validate_correlation_input(data) -> tuple:
    """Validate input data for correlation analysis.

    Checks that the data is a list of dictionaries with sufficient data
    points and numeric fields for meaningful correlation computation.

    Args:
        data: Expected to be a list of dictionaries containing numeric fields.

    Returns:
        A tuple of (is_valid, error_message) where is_valid is True and
        error_message is None on success, or is_valid is False and
        error_message describes the validation failure.
    """
    if data is None:
        return False, 'Input data cannot be None'

    if not isinstance(data, list):
        return False, 'Input data must be a list of dictionaries'

    if len(data) < 5:
        return False, (
            f'At least 5 data points are required for correlation analysis, '
            f'got {len(data)}'
        )

    for i, item in enumerate(data):
        if not isinstance(item, dict):
            return False, f'Data point at index {i} must be a dictionary'

        # Check that each dict has at least 2 numeric fields
        numeric_count = sum(
            1 for v in item.values() if isinstance(v, (int, float))
        )
        if numeric_count < 2:
            return False, (
                f'Data point at index {i} must have at least 2 numeric fields, '
                f'found {numeric_count}'
            )

    return True, None
