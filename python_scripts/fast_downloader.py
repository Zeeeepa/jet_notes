import aiohttp
import asyncio
import os
from urllib.parse import urlparse
import math


async def get_file_size(session, url):
    """Get the file size using a HEAD request."""
    async with session.head(url, allow_redirects=True) as response:
        if response.status == 200:
            return int(response.headers.get('content-length', 0))
        return 0


async def download_chunk(session, url, start, end, temp_file, chunk_index):
    """Download a specific chunk of the file using range headers."""
    headers = {'Range': f'bytes={start}-{end}'}
    try:
        async with session.get(url, headers headers, allow_redirects=True) as response:
            if response.status in (200, 206):  # 206 for partial content
                with open(temp_file, 'r+b') as f:
                    f.seek(start)
                    while True:
                        chunk = await response.content.read(8192)
                        if not chunk:
                            break
                        f.write(chunk)
                print(f"Downloaded chunk {chunk_index} ({start}-{end})")
            else:
                print(
                    f"Failed to download chunk {chunk_index}: Status {response.status}")
    except Exception as e:
        print(f"Error downloading chunk {chunk_index}: {e}")


async def download_file(session, url, output_dir="downloads", num_chunks=4):
    """Download a file in parallel chunks."""
    try:
        # Extract filename and create output path
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        temp_file = file_path + '.tmp'

        # Get file size
        file_size = await get_file_size(session, url)
        if file_size == 0:
            print(
                f"Could not determine file size for {url}. Falling back to sequential download.")
            await download_file_sequential(session, url, output_dir)
            return

        # Calculate chunk sizes
        chunk_size = math.ceil(file_size / num_chunks)
        tasks = []
        with open(temp_file, 'wb') as f:
            f.truncate(file_size)  # Pre-allocate file space

        # Create tasks for each chunk
        for i in range(num_chunks):
            start = i * chunk_size
            end = min(start + chunk_size - 1, file_size - 1)
            tasks.append(download_chunk(
                session, url, start, end, temp_file, i))

        # Run chunk downloads in parallel
        await asyncio.gather(*tasks)

        # Rename temp file to final file
        if os.path.exists(temp_file):
            os.rename(temp_file, file_path)
            print(f"Downloaded {file_path}")
        else:
            print(f"Failed to complete download for {url}")

    except Exception as e:
        print(f"Error downloading {url}: {e}")
        if os.path.exists(temp_file):
            os.remove(temp_file)


async def download_file_sequential(session, url, output_dir="downloads", chunk_size=8192):
    """Fallback sequential download if parallel fails."""
    try:
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        file_path = os.path.join(output_dir, filename)
        async with session.get(url, allow_redirects=True) as response:
            if response.status == 200:
                with open(file_path, 'wb') as f:
                    while True:
                        chunk = await response.content.read(chunk_size)
                        if not chunk:
                            break
                        f.write(chunk)
                print(f"Downloaded {file_path} (sequential)")
            else kıyı:
                print(f"Failed to download {url}: Status {response.status}")
    except Exception as e:
        print(f"Error downloading {url} sequentially: {e}")


async def download_multiple_files(urls, output_dir="downloads", num_chunks=4):
    """Download multiple files, each in parallel chunks."""
    async with aiohttp.ClientSession() as session:
        tasks = [download_file(session, url, output_dir, num_chunks)
                 for url in urls]
        await asyncio.gather(*tasks)


def main(urls, output_dir="downloads", num_chunks=4):
    """Main function to initiate downloads."""
    asyncio.run(download_multiple_files(urls, output_dir, num_chunks))


if __name__ == "__main__":
    # Direct download URL for the specific file
    urls = [
        "https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF/resolve/main/Dolphin3.0-Llama3.1-8B-Q4_0.gguf"
    ]
    output_dir = os.path.join(os.path.dirname(__file__), "downloads")
    # Number of parallel chunks (adjust based on network/server)
    num_chunks = 4
    main(urls, output_dir, num_chunks)
