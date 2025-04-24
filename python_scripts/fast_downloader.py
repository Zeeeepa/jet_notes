import aiohttp
import asyncio
import os
from urllib.parse import urlparse
import math
from tqdm.asyncio import tqdm
import aiohttp.client_exceptions


async def get_file_size(session, url):
    """Get the file size using a HEAD request."""
    async with session.head(url, allow_redirects=True) as response:
        if response.status == 200:
            return int(response.headers.get('content-length', 0))
        return 0


async def download_chunk(session, url, start, end, temp_file, chunk_index, progress_bar, max_retries=3):
    """Download a specific chunk of the file using range headers with progress tracking."""
    headers = {'Range': f'bytes={start}-{end}'}
    chunk_size = end - start + 1
    for attempt in range(max_retries):
        try:
            async with session.get(url, headers=headers, allow_redirects=True) as response:
                if response.status in (200, 206):  # 206 for partial content
                    downloaded = 0
                    with open(temp_file, 'r+b') as f:
                        f.seek(start)
                        async for chunk in response.content.iter_chunked(8192):
                            f.write(chunk)
                            downloaded += len(chunk)
                            progress_bar.update(len(chunk))
                    print(f"Completed chunk {chunk_index} ({start}-{end})")
                    return
                else:
                    print(
                        f"Failed to download chunk {chunk_index}: Status {response.status}")
        except (aiohttp.ClientError, aiohttp.client_exceptions.ClientConnectorError) as e:
            print(
                f"Error downloading chunk {chunk_index} (attempt {attempt + 1}/{max_retries}): {e}")
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
    print(
        f"Failed to download chunk {chunk_index} after {max_retries} attempts")
    raise RuntimeError(f"Chunk {chunk_index} failed")


async def download_file(session, url, output_dir="downloads", num_chunks=4):
    """Download a file in parallel chunks with progress tracking."""
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

        # Create progress bar for the entire file
        with tqdm(total=file_size, unit='B', unit_scale=True, desc=filename, position=0) as pbar:
            # Create tasks for each chunk
            for i in range(num_chunks):
                start = i * chunk_size
                end = min(start + chunk_size - 1, file_size - 1)
                tasks.append(download_chunk(
                    session, url, start, end, temp_file, i, pbar))

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
    """Fallback sequential download with progress tracking."""
    try:
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        file_path = os.path.join(output_dir, filename)
        file_size = await get_file_size(session, url)

        async with session.get(url, allow_redirects=True) as response:
            if response.status == 200:
                with open(file_path, 'wb') as f, tqdm(total=file_size, unit='B', unit_scale=True, desc=filename, position=0) as pbar:
                    async for chunk in response.content.iter_chunked(chunk_size):
                        f.write(chunk)
                        pbar.update(len(chunk))
                print(f"Downloaded {file_path} (sequential)")
            else:
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
    num_chunks = 4  # Number of parallel chunks
    main(urls, output_dir, num_chunks)
