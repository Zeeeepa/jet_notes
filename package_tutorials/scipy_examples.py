import numpy as np
from scipy import integrate, optimize, interpolate, linalg, stats, signal, special, sparse
import pytest

# 1. Integration: Compute definite integral of x^2 from 0 to 1


def compute_integral():
    result, _ = integrate.quad(lambda x: x**2, 0, 1)
    return result

# 2. Optimization: Find minimum of x^2 + 2x + 1


def find_minimum():
    result = optimize.minimize(lambda x: x**2 + 2*x + 1, x0=0)
    return result.x[0]

# 3. Interpolation: Interpolate data points


def interpolate_data():
    x = np.array([0, 1, 2])
    y = np.array([1, 3, 2])
    f = interpolate.interp1d(x, y, kind='linear')
    return f([0.5, 1.5]).tolist()

# 4. Linear Algebra: Solve Ax = b


def solve_linear_system():
    A = np.array([[3, 1], [1, 2]])
    b = np.array([9, 8])
    x = linalg.solve(A, b)
    return x.tolist()

# 5. Statistics: Perform t-test on two samples


def perform_ttest():
    sample1 = np.array([1, 2, 3, 4, 5])
    sample2 = np.array([2, 4, 6, 8, 10])
    stat, p_value = stats.ttest_ind(sample1, sample2)
    return p_value

# 6. Signal Processing: Apply a low-pass Butterworth filter


def apply_butterworth_filter():
    t = np.linspace(0, 1, 100)
    signal_data = np.sin(2 * np.pi * 5 * t) + 0.5 * np.random.randn(100)
    b, a = signal.butter(4, 0.2)
    filtered = signal.filtfilt(b, a, signal_data)
    return filtered[:3].tolist()  # Return first 3 for testing

# 7. Special Functions: Compute Bessel function J0


def compute_bessel():
    return special.j0(1.0)

# 8. Sparse Matrices: Create and sum a sparse matrix


def sparse_matrix_sum():
    data = np.array([1, 2, 3])
    row = np.array([0, 1, 2])
    col = np.array([0, 1, 2])
    matrix = sparse.csr_matrix((data, (row, col)), shape=(3, 3))
    return matrix.sum()

# Test class using pytest


class TestSciPyFeatures:
    def test_compute_integral(self):
        result = compute_integral()
        expected = 0.3333333333333333  # Integral of x^2 from 0 to 1 is 1/3
        assert abs(
            result - expected) < 1e-6, f"Expected {expected}, got {result}"

    def test_find_minimum(self):
        result = find_minimum()
        expected = -1.0  # Minimum of x^2 + 2x + 1 is at x = -1
        assert abs(
            result - expected) < 1e-6, f"Expected {expected}, got {result}"

    def test_interpolate_data(self):
        result = interpolate_data()
        expected = [2.0, 2.5]  # Linear interpolation at x=0.5, 1.5
        assert result == expected, f"Expected {expected}, got {result}"

    def test_solve_linear_system(self):
        result = solve_linear_system()
        expected = [2.0, 3.0]  # Solution to Ax = b
        assert all(abs(a - b) < 1e-6 for a, b in zip(result, expected)
                   ), f"Expected {expected}, got {result}"

    def test_perform_ttest(self):
        result = perform_ttest()
        # Expected p-value (approximate, depends on data)
        expected = 0.10366711014386325
        assert abs(
            result - expected) < 1e-6, f"Expected {expected}, got {result}"

    def test_apply_butterworth_filter(self):
        result = apply_butterworth_filter()
        # Expected values depend on random noise, so we check length and type
        expected = 3  # First 3 elements
        assert len(
            result) == expected, f"Expected length {expected}, got {len(result)}"
        assert all(isinstance(x, float)
                   for x in result), "Expected float values"

    def test_compute_bessel(self):
        result = compute_bessel()
        expected = 0.7651976865579666  # J0(1.0)
        assert abs(
            result - expected) < 1e-6, f"Expected {expected}, got {result}"

    def test_sparse_matrix_sum(self):
        result = sparse_matrix_sum()
        expected = 6  # Sum of [1, 2, 3]
        assert result == expected, f"Expected {expected}, got {result}"


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main(["-v", __file__])
