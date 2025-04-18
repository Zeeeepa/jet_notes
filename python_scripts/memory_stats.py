import subprocess
import re


def bytes_to_gb(bytes_value):
    """Convert bytes to GB with 2 decimal places."""
    return round(bytes_value / (1024 ** 3), 2)


# Physical Memory (total RAM in bytes)
physical_memory = int(subprocess.check_output(
    ["sysctl", "-n", "hw.memsize"]).decode().strip())
physical_memory_gb = bytes_to_gb(physical_memory)

# Memory Used (from top)
top_output = subprocess.check_output(["top", "-l", "1"]).decode()
memory_used_match = re.search(r"PhysMem:\s*(\d+\.?\d*[GM])", top_output)
if memory_used_match:
    memory_used_str = memory_used_match.group(1)
    if "G" in memory_used_str:
        memory_used = float(memory_used_str.replace("G", ""))
    elif "M" in memory_used_str:
        memory_used = float(memory_used_str.replace("M", "")) / 1024
    memory_used_gb = bytes_to_gb(memory_used * (1024 ** 3))
else:
    memory_used_gb = 0.0

# Cached Files (approximated from vm_stat)
vm_stat_output = subprocess.check_output(["vm_stat"]).decode()
page_size_match = re.search(r"page size of (\d+) bytes", vm_stat_output)
cached_files_pages_match = re.search(
    r"Pages speculative:\s*(\d+)", vm_stat_output)
if page_size_match and cached_files_pages_match:
    page_size = int(page_size_match.group(1))
    cached_files_pages = int(cached_files_pages_match.group(1))
    cached_files_bytes = cached_files_pages * page_size
    cached_files_gb = bytes_to_gb(cached_files_bytes)
else:
    cached_files_gb = 0.0

# Swap Used (from sysctl)
swap_output = subprocess.check_output(
    ["sysctl", "-n", "vm.swapusage"]).decode()
swap_used_match = re.search(r"used = (\d+\.?\d*[GM])", swap_output)
if swap_used_match:
    swap_used_str = swap_used_match.group(1)
    if "G" in swap_used_str:
        swap_used = float(swap_used_str.replace("G", ""))
    elif "M" in swap_used_str:
        swap_used = float(swap_used_str.replace("M", "")) / 1024
    swap_used_gb = bytes_to_gb(swap_used * (1024 ** 3))
else:
    swap_used_gb = 0.0

# Print stats
print(f"Physical Memory: {physical_memory_gb} GB")
print(f"Memory Used: {memory_used_gb} GB")
print(f"Cached Files: {cached_files_gb} GB")
print(f"Swap Used: {swap_used_gb} GB")
