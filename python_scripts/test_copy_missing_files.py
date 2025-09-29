import os
import tempfile
import shutil
from pathlib import Path
import pytest

# replace with actual module import
from copy_missing_files import copy_missing_files


class TestCopyMissingFiles:
    def setup_method(self):
        # Create temporary source and target directories
        self.temp_dir = tempfile.TemporaryDirectory()
        self.source = Path(self.temp_dir.name) / "source"
        self.target = Path(self.temp_dir.name) / "target"

        self.source.mkdir()
        self.target.mkdir()

    def teardown_method(self):
        # Cleanup temp dirs
        self.temp_dir.cleanup()

    def test_copy_new_files(self):
        # Create a file in source
        src_file = self.source / "file1.txt"
        src_file.write_text("hello world")

        # Run copy
        copy_missing_files(str(self.source), str(self.target))

        # Verify file copied
        tgt_file = self.target / "file1.txt"
        assert tgt_file.exists()
        assert tgt_file.read_text() == "hello world"

    def test_skip_existing_files(self):
        # Create a file in source
        src_file = self.source / "file2.txt"
        src_file.write_text("from source")

        # Create same file in target
        tgt_file = self.target / "file2.txt"
        tgt_file.write_text("already here")

        # Run copy
        copy_missing_files(str(self.source), str(self.target))

        # File should not be overwritten
        assert tgt_file.read_text() == "already here"

    def test_recursive_copy(self):
        # Create nested file in source
        nested_dir = self.source / "nested"
        nested_dir.mkdir()
        nested_file = nested_dir / "deep.txt"
        nested_file.write_text("deep content")

        # Run copy
        copy_missing_files(str(self.source), str(self.target))

        # Verify nested structure preserved
        tgt_file = self.target / "nested" / "deep.txt"
        assert tgt_file.exists()
        assert tgt_file.read_text() == "deep content"

    def test_no_files_in_source(self):
        # Run copy when source is empty
        copy_missing_files(str(self.source), str(self.target))

        # Target should remain empty
        assert not any(self.target.iterdir())
