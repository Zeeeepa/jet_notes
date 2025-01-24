import os
from typing import List

from jet.logger import logger


def filter_existing_paths(paths: List[str]) -> List[str]:
    """
    Filters out non-existent paths from the provided list of absolute paths.

    Args:
        paths (List[str]): A list of absolute paths.

    Returns:
        List[str]: A list containing only the paths that exist.
    """
    existing_paths = [path for path in paths if os.path.exists(path)]
    return existing_paths


if __name__ == "__main__":
    # Example: Provide a list of absolute paths to test
    test_paths = [
        "/home/user/documents",  # Replace with valid paths on your system
        "/invalid/path/to/check",
        "/usr/bin/python3",
    ]

    existing_paths = filter_existing_paths(test_paths)
    non_existing_paths = [
        path for path in test_paths if not os.path.exists(path)]

    logger.newline()
    logger.info(f"Input Paths ({len(test_paths)})")
    logger.debug(f"Existing Paths ({len(existing_paths)}):")
    logger.success(format_json(existing_paths))
    logger.debug(f"Non-Existing Paths ({len(non_existing_paths)}):")
    logger.error(format_json(non_existing_paths))
