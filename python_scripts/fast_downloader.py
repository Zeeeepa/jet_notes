import time
import aiohttp
import asyncio
import os
from urllib.parse import urlparse
import math
from jet.logger import logger
from tqdm.asyncio import tqdm
import aiohttp.client_exceptions


async def get_file_size(session, url):
    """Get the file size and check for range request support using a HEAD request."""
    logger.debug(f"Checking file size and range support for {url}")
    async with session.head(url, allow_redirects=True) as response:
        if response.status == 200:
            file_size = int(response.headers.get('content-length', 0))
            range_support = response.headers.get('Accept-Ranges') == 'bytes'
            logger.info(
                f"File size: {file_size} bytes, Range support: {range_support} for {url}")
            return file_size, range_support
        logger.warning(
            f"HEAD request failed for {url}, status: {response.status}")
        return 0, False


async def download_chunk(session, url, start, end, temp_file, chunk_index, progress_bar, max_retries=3):
    """Download a specific chunk of the file using range headers with progress tracking."""
    headers = {'Range': f'bytes={start}-{end}'}
    chunk_size = end - start + 1
    logger.debug(
        f"Starting download of chunk {chunk_index} ({start}-{end}) for {url}")
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
                    logger.info(
                        f"Completed chunk {chunk_index} ({start}-{end}) for {url}")
                    return
                else:
                    logger.error(
                        f"Failed to download chunk {chunk_index} for {url}: Status {response.status}")
        except (aiohttp.ClientError, aiohttp.client_exceptions.ClientConnectorError) as e:
            logger.warning(
                f"Error downloading chunk {chunk_index} for {url} (attempt {attempt + 1}/{max_retries}): {e}")
        if attempt < max_retries - 1:
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
    logger.error(
        f"Failed to download chunk {chunk_index} for {url} after {max_retries} attempts")
    raise RuntimeError(f"Chunk {chunk_index} failed")


async def download_file(session, url, output_dir="downloads", num_chunks=3):
    """Download a file in parallel chunks with progress tracking if range requests are supported."""
    try:
        # Extract filename and create output path
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        temp_file = file_path + '.tmp'
        logger.info(
            f"Starting parallel download of {url} to {file_path} with {num_chunks} chunks")

        # Get file size and range support
        file_size, range_support = await get_file_size(session, url)
        if file_size == 0 or not range_support:
            reason = "file size not determined" if file_size == 0 else "range requests not supported"
            logger.warning(
                f"Falling back to sequential download for {url} ({reason}). num_chunks={num_chunks} ignored.")
            await download_file_sequential(session, url, output_dir)
            return

        # Calculate chunk sizes
        chunk_size = math.ceil(file_size / num_chunks)
        tasks = []
        with open(temp_file, 'wb') as f:
            f.truncate(file_size)  # Pre-allocate file space
        logger.debug(f"Pre-allocated {file_size} bytes for {temp_file}")
        logger.info(
            f"Downloading {url} in parallel with {num_chunks} chunks, chunk size: {chunk_size} bytes")

        # Create progress bar for the entire file
        with tqdm(total=file_size, unit='B', unit_scale=True, desc=filename, position=0) as pbar:
            # Create tasks for each chunk
            for i in range(num_chunks):
                start = i * chunk_size
                end = min(start + chunk_size - 1, file_size - 1)
                tasks.append(download_chunk(
                    session, url, start, end, temp_file, i, pbar))

            # Run chunk downloads in parallel
            logger.debug(
                f"Starting {len(tasks)} parallel download tasks for {url}")
            await asyncio.gather(*tasks)

        # Rename temp file to final file
        if os.path.exists(temp_file):
            os.rename(temp_file, file_path)
            logger.info(
                f"Successfully downloaded {file_path} in parallel with {num_chunks} chunks")
        else:
            logger.error(
                f"Failed to complete download for {url}: Temporary file missing")

    except Exception as e:
        logger.error(
            f"Error downloading {url} in parallel: {e}", exc_info=True)
        if os.path.exists(temp_file):
            os.remove(temp_file)
            logger.debug(f"Cleaned up temporary file {temp_file}")


async def download_file_sequential(session, url, output_dir="downloads", chunk_size=8192):
    """Fallback sequential download with progress tracking."""
    try:
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        file_path = os.path.join(output_dir, filename)
        logger.info(f"Starting sequential download of {url} to {file_path}")

        file_size, _ = await get_file_size(session, url)

        async with session.get(url, allow_redirects=True) as response:
            if response.status == 200:
                with open(file_path, 'wb') as f, tqdm(total=file_size, unit='B', unit_scale=True, desc=filename, position=0) as pbar:
                    async for chunk in response.content.iter_chunked(chunk_size):
                        f.write(chunk)
                        pbar.update(len(chunk))
                logger.info(
                    f"Successfully downloaded {file_path} in sequential mode")
            else:
                logger.error(
                    f"Failed to download {url} sequentially: Status {response.status}")
    except Exception as e:
        logger.error(
            f"Error downloading {url} sequentially: {e}", exc_info=True)


async def download_multiple_files(urls, output_dir="downloads", num_chunks=4):
    """Download multiple files, each in parallel chunks."""
    async with aiohttp.ClientSession() as session:
        tasks = [download_file(session, url, output_dir, num_chunks)
                 for url in urls]
        await asyncio.gather(*tasks)


def main(urls, output_dir="downloads", num_chunks=4):
    """Main function to initiate downloads."""
    start_time = time.time()
    logger.info(
        f"Starting download of {len(urls)} file(s) with up to {num_chunks} chunks per file")
    asyncio.run(download_multiple_files(urls, output_dir, num_chunks))
    elapsed_time = time.time() - start_time
    logger.info(
        f"Completed all downloads in {elapsed_time:.2f} seconds")


def benchmark_chunk_counts(url, output_dir="downloads", max_chunks=4):
    results = []
    for num_chunks in range(1, max_chunks + 1):
        logger.info(f"\nBenchmarking with {num_chunks} chunk(s)")
        start_time = time.time()
        asyncio.run(download_multiple_files([url], output_dir, num_chunks))
        elapsed = time.time() - start_time
        logger.info(
            f"Time taken with {num_chunks} chunk(s): {elapsed:.2f} seconds")
        results.append((num_chunks, elapsed))

    # Summary of results
    logger.info("\nBenchmark Summary:")
    for chunks, time_taken in results:
        logger.info(f"{chunks} chunk(s): {time_taken:.2f} seconds")


if __name__ == "__main__":
    # Direct download URL for the specific file
    url = "http://ipv4.download.thinkbroadband.com/100MB.zip"
    output_dir = os.path.join(os.path.dirname(__file__), "downloads")

    benchmark_chunk_counts(url, output_dir)


if __name__ == "__main__":
    # Direct download URL for the specific file
    urls = [
        "https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF/blob/main/Dolphin3.0-Llama3.1-8B-Q4_0.gguf",
    ]
    output_dir = os.path.join(os.path.dirname(__file__), "downloads")
    num_chunks = 3  # Number of parallel chunks
    main(urls, output_dir, num_chunks)
