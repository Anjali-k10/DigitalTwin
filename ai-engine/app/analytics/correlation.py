"""Behavioral Correlation Analysis Module.

This module provides tools for computing correlation matrices from behavioral
data, identifying statistically significant relationships, and generating
human-readable insights from the analysis.
"""

import pandas as pd
import numpy as np


class BehavioralCorrelation:
    """Analyzes correlations between behavioral metrics.

    Computes Pearson correlation coefficients across all numeric variables in
    a dataset, extracts statistically meaningful relationships, and translates
    them into plain-English insights.
    """

    def analyze(self, data: list) -> dict:
        """Perform correlation analysis on a list of behavioral data points.

        Args:
            data: A list of dictionaries, where each dictionary represents one
                observation with numeric fields as behavioral metrics.

        Returns:
            A dictionary containing:
                - correlation_matrix (dict): Nested dict of pairwise Pearson
                  correlation coefficients.
                - strong_correlations (list[dict]): Pairs of variables with
                  |r| > 0.5, each containing 'variables', 'coefficient', and
                  'strength'.
                - insights (list[str]): Human-readable descriptions of the
                  strong correlations found.
        """
        df = pd.DataFrame(data)

        # Select only numeric columns for correlation computation
        numeric_df = df.select_dtypes(include=[np.number])

        # Compute Pearson correlation matrix
        corr_matrix = numeric_df.corr(method='pearson')

        # Extract strong correlations (|r| > 0.5, excluding self-correlations)
        strong_correlations = []
        columns = corr_matrix.columns.tolist()
        seen_pairs = set()

        for i, col_a in enumerate(columns):
            for j, col_b in enumerate(columns):
                if i >= j:
                    continue  # Skip self and duplicate pairs

                pair_key = tuple(sorted([col_a, col_b]))
                if pair_key in seen_pairs:
                    continue
                seen_pairs.add(pair_key)

                coeff = corr_matrix.loc[col_a, col_b]

                if pd.isna(coeff):
                    continue

                if abs(coeff) > 0.5:
                    strong_correlations.append({
                        'variables': [col_a, col_b],
                        'coefficient': round(float(coeff), 4),
                        'strength': self._get_strength_label(coeff),
                    })

        # Sort by absolute coefficient descending
        strong_correlations.sort(key=lambda x: abs(x['coefficient']), reverse=True)

        # Generate human-readable insights
        insights = self._generate_insights(strong_correlations)

        # Convert correlation matrix to nested dict for JSON serialization
        corr_dict = {}
        for col in corr_matrix.columns:
            corr_dict[col] = {
                row: round(float(corr_matrix.loc[row, col]), 4)
                for row in corr_matrix.index
            }

        return {
            'correlation_matrix': corr_dict,
            'strong_correlations': strong_correlations,
            'insights': insights,
        }

    def _get_strength_label(self, coeff: float) -> str:
        """Classify the strength of a correlation coefficient.

        Args:
            coeff: Pearson correlation coefficient (-1.0 to 1.0).

        Returns:
            A string label: 'very strong', 'strong', 'moderate', or 'weak'.
        """
        abs_coeff = abs(coeff)
        if abs_coeff > 0.8:
            return 'very strong'
        elif abs_coeff > 0.6:
            return 'strong'
        elif abs_coeff > 0.4:
            return 'moderate'
        else:
            return 'weak'

    def _generate_insights(self, strong_correlations: list) -> list:
        """Convert strong correlations into plain-English insight sentences.

        Args:
            strong_correlations: List of correlation dictionaries with
                'variables', 'coefficient', and 'strength' keys.

        Returns:
            A list of human-readable insight strings.
        """
        insights = []

        for corr in strong_correlations:
            var_a, var_b = corr['variables']
            coeff = corr['coefficient']
            strength = corr['strength']
            direction = 'positive' if coeff > 0 else 'negative'

            # Format variable names for readability
            readable_a = var_a.replace('_', ' ')
            readable_b = var_b.replace('_', ' ')

            insight = (
                f"There is a {strength} {direction} correlation (r={coeff:.2f}) "
                f"between {readable_a} and {readable_b}."
            )
            insights.append(insight)

        if not insights:
            insights.append(
                'No strong correlations (|r| > 0.5) were found in the provided data.'
            )

        return insights
