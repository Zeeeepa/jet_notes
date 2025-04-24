import aiohttp
import asyncio
import os
from urllib.parse import urlparse


async def download_file(session, url, chunk_size=8192):
    try:
        # Extract filename from URL
        filename = os.path.basename(urlparse(url).path) or "downloaded_file"
        async with session.get(url, allow_redirects=True) as response:
            if response.status == 200:
                with open(filename, 'wb') as f:
                    while True:
                        chunk = await response.content.read(chunk_size)
                        if not chunk:
                            break
                        f.write(chunk)
                print(f"Downloaded {filename}")
            else:
                print(f"Failed to download {url}: Status {response.status}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")


async def download_multiple_files(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [download_file(session, url) for url in urls]
        await asyncio.gather(*tasks)


def main(urls):
    # Run the async download
    asyncio.run(download_multiple_files(urls))


if __name__ == "__main__":
    # Direct download URL for the specific file
    urls = [
        "https://huggingface.co/cognitivecomputations/Dolphin3.0-Llama3.1-8B-GGUF/resolve/main/Dolphin3.0-Llama3.1-8B-Q4_0.gguf"
    ]
    main(urls)
