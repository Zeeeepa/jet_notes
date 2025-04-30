import socket
import argparse

from jet.logger import logger


def get_ip_address(hostname):
    """Resolve hostname to IP address."""
    try:
        ip_address = socket.gethostbyname(hostname)
        return ip_address
    except socket.gaierror as e:
        raise ValueError(f"Failed to resolve hostname '{hostname}': {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate hosts.txt for distributed_run")
    parser.add_argument("--hostname", default="Jethros-MacBook-Air.local",
                        help="Hostname to resolve (default: Jethros-MacBook-Air.local)")
    args = parser.parse_args()

    try:
        ip_address = get_ip_address(args.hostname)
        logger.success(
            f"Host name: {args.hostname} -> IP Address: {ip_address}")
    except ValueError as e:
        logger.error(f"Error: {e}")
        exit(1)
