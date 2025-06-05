import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.feature_selection import SelectKBest, f_classif
import pytest

# 1. Preprocessing: Standardize features


def standardize_data():
    X = np.array([[1, 2], [3, 4], [5, 6]])
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled[:, 0].tolist()  # Return first column for testing

# 2. Classification: Logistic regression


def logistic_regression():
    X = np.array([[1, 2], [2, 3], [3, 4], [4, 5]])
    y = np.array([0, 0, 1, 1])
    model = LogisticRegression()
    model.fit(X, y)
    return model.predict([[2.5, 3.5]]).tolist()

# 3. Regression: Linear regression


def linear_regression():
    X = np.array([[1], [2], [3], [4]])
    y = np.array([2, 4, 6, 8])
    model = LinearRegression()
    model.fit(X, y)
    return model.predict([[5]]).tolist()

# 4. Clustering: K-means clustering


def kmeans_clustering():
    X = np.array([[1, 2], [1.5, 1.8], [5, 8], [8, 8]])
    kmeans = KMeans(n_clusters=2, random_state=0)
    kmeans.fit(X)
    return kmeans.labels_.tolist()

# 5. Dimensionality Reduction: PCA


def apply_pca():
    X = np.array([[1, 2], [3, 4], [5, 6]])
    pca = PCA(n_components=1)
    X_reduced = pca.fit_transform(X)
    return X_reduced.flatten().tolist()

# 6. Model Selection: Train-test split


def train_test_split_data():
    X = np.array([[1, 2], [3, 4], [5, 6], [7, 8]])
    y = np.array([0, 1, 0, 1])
    X_train, X_test, _, _ = train_test_split(
        X, y, test_size=0.25, random_state=0)
    return X_train.tolist()

# 7. Metrics: Accuracy score


def compute_accuracy():
    y_true = np.array([0, 1, 1, 0])
    y_pred = np.array([0, 1, 0, 0])
    return accuracy_score(y_true, y_pred)

# 8. Feature Selection: Select top feature


def select_features():
    X = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    y = np.array([0, 1, 0])
    selector = SelectKBest(score_func=f_classif, k=1)
    X_selected = selector.fit_transform(X, y)
    return X_selected.flatten().tolist()

# Test class using pytest


class TestSklearnFeatures:
    def test_standardize_data(self):
        result = standardize_data()
        # Standardized first column
        expected = [-1.224744871391589, 0.0, 1.224744871391589]
        assert all(abs(a - b) < 1e-6 for a, b in zip(result, expected)
                   ), f"Expected {expected}, got {result}"

    def test_logistic_regression(self):
        result = logistic_regression()
        expected = [1]  # Predicted class for input [2.5, 3.5]
        assert result == expected, f"Expected {expected}, got {result}"

    def test_linear_regression(self):
        result = linear_regression()
        expected = [10.0]  # Predicted value for x=5
        assert all(abs(a - b) < 1e-6 for a, b in zip(result, expected)
                   ), f"Expected {expected}, got {result}"

    def test_kmeans_clustering(self):
        result = kmeans_clustering()
        expected = [0, 0, 1, 1]  # Cluster labels
        assert result == expected, f"Expected {expected}, got {result}"

    def test_apply_pca(self):
        result = apply_pca()
        expected = [-2.8284271247461903, 0.0,
                    2.8284271247461903]  # PCA results
        assert all(abs(a - b) < 1e-6 for a, b in zip(result, expected)
                   ), f"Expected {expected}, got {result}"

    def test_train_test_split_data(self):
        result = train_test_split_data()
        expected = [[5, 6], [1, 2], [7, 8]]  # Training set
        assert result == expected, f"Expected {expected}, got {result}"

    def test_compute_accuracy(self):
        result = compute_accuracy()
        expected = 0.75  # Accuracy: 3/4 correct
        assert abs(
            result - expected) < 1e-6, f"Expected {expected}, got {result}"

    def test_select_features(self):
        result = select_features()
        expected = [2, 5, 8]  # Selected feature (second column)
        assert result == expected, f"Expected {expected}, got {result}"


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main(["-v", __file__])
