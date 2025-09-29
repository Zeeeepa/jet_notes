import os
import shutil


def copy_missing_files(src, dst):
    for root, dirs, files in os.walk(src):
        # Compute relative path from source
        rel_path = os.path.relpath(root, src)
        target_root = os.path.join(dst, rel_path)

        # Ensure target directory exists
        os.makedirs(target_root, exist_ok=True)

        for file in files:
            src_file = os.path.join(root, file)
            dst_file = os.path.join(target_root, file)

            # Only copy if file does not already exist
            if not os.path.exists(dst_file):
                shutil.copy2(src_file, dst_file)
                print(f"Copied: {src_file} -> {dst_file}")
            else:
                print(f"Skipped (already exists): {dst_file}")


if __name__ == "__main__":
    source_dir = "/Users/jethroestrada/Desktop/External_Projects/AI/repo-libs/langchain/docs/docs"
    target_dir = "/Users/jethroestrada/Desktop/External_Projects/Jet_Projects/JetScripts/converted_doc_scripts/langchain/converted-notebooks/docs/docs"
    copy_missing_files(source_dir, target_dir)
