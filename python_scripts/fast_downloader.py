import aiohttp
import asyncio
import os
from urllib.parse import urlparse


async def download_file(session, url, output_dir="downloads", chunk_size=8192):
    try:
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        # Extract filename from URL
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        # Full path for saving the file
        file_path = os.path.join(output_dir, filename)
        async with session.get(url, allow_redirects=True) as response:
            if response.status == 200:
                with open(file_path, 'wb') as f:
                    while True:
                        chunk = await response.content.read(chunk_size)
                        if not chunk:
                            break
                        f.write(chunk)
                print(f"Downloaded {file_path}")
            else:
                print(f"Failed to download {url}: Status {response.status}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")


async def download_multiple_files(urls, output_dir="downloads"):
    async with aiohttp.ClientSession() as session:
        tasks = [download_file(session, url, output_dir) for url in urls]
        await asyncio.gather(*tasks)


def main(urls, output_dir="downloads"):
    # Run the async download
    asyncio.run(download_multiple_files(urls, output_dir))


if __name__ == "__main__":
    # Direct download URL for the specific file
    urls = [
        "https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF/resolve/main/Dolphin3.0-Llama3.1-8B-Q4_0.gguf"
    ]
    # Specify your desired output directory
    output_dir = os.path.join(os.path.dirname(__file__), "downloads")
    main(urls, output_dir)
