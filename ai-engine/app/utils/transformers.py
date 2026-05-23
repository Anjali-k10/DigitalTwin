"""Data Transformation Utilities.

This module provides static utility methods for common data transformations
including normalization, missing value imputation, feature extraction,
and value clipping.
"""


class DataTransformer:
    """Static utility class for data preprocessing transformations.

    All methods are stateless and operate on dictionaries, making them
    suitable for use in request preprocessing pipelines.
    """

    @staticmethod
    def normalize(data: dict, ranges: dict) -> dict:
        """Min-max normalize each field using the provided ranges.

        Scales each value to the [0, 1] interval based on the specified
        minimum and maximum for that field.

        Args:
            data: Dictionary of field names to raw values.
            ranges: Dictionary of field names to (min, max) tuples defining
                the normalization range for each field.

        Returns:
            A new dictionary with normalized values in [0, 1].

        Example:
            >>> DataTransformer.normalize(
            ...     {'hours': 12}, {'hours': (0, 24)}
            ... )
            {'hours': 0.5}
        """
        normalized = {}
        for key, value in data.items():
            if key in ranges:
                min_val, max_val = ranges[key]
                range_span = max_val - min_val
                if range_span == 0:
                    normalized[key] = 0.0
                else:
                    normalized[key] = (value - min_val) / range_span
            else:
                normalized[key] = value
        return normalized

    @staticmethod
    def impute_missing(data: dict, defaults: dict) -> dict:
        """Fill missing fields with default values.

        Creates a new dictionary containing all keys from both data and
        defaults, using the data value when present and the default
        value when the key is missing from data.

        Args:
            data: Dictionary of field names to values (may have missing keys).
            defaults: Dictionary of field names to default values.

        Returns:
            A new dictionary with missing fields filled from defaults.

        Example:
            >>> DataTransformer.impute_missing(
            ...     {'a': 1}, {'a': 0, 'b': 5}
            ... )
            {'a': 1, 'b': 5}
        """
        result = dict(defaults)
        result.update(data)
        return result

    @staticmethod
    def to_feature_array(data: dict, feature_names: list) -> list:
        """Extract feature values in a consistent order.

        Extracts values from the data dictionary in the exact order
        specified by feature_names, ensuring consistent feature ordering
        for model input.

        Args:
            data: Dictionary of field names to values.
            feature_names: Ordered list of feature names to extract.

        Returns:
            A list of values in the same order as feature_names.

        Raises:
            KeyError: If a required feature name is not found in data.

        Example:
            >>> DataTransformer.to_feature_array(
            ...     {'b': 2, 'a': 1}, ['a', 'b']
            ... )
            [1, 2]
        """
        return [data[name] for name in feature_names]

    @staticmethod
    def clip_values(data: dict, ranges: dict) -> dict:
        """Clip each field's value to its specified min/max range.

        Values below the minimum are set to the minimum; values above
        the maximum are set to the maximum.

        Args:
            data: Dictionary of field names to values.
            ranges: Dictionary of field names to (min, max) tuples.

        Returns:
            A new dictionary with values clipped to their ranges.

        Example:
            >>> DataTransformer.clip_values(
            ...     {'hours': 30}, {'hours': (0, 24)}
            ... )
            {'hours': 24}
        """
        clipped = {}
        for key, value in data.items():
            if key in ranges:
                min_val, max_val = ranges[key]
                clipped[key] = max(min_val, min(value, max_val))
            else:
                clipped[key] = value
        return clipped
