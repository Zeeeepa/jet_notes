import socket
import argparse
import os


def resolve_hostname(hostname):
    """Resolve hostname to IP address."""
    try:
        ip_address = socket.gethostbyname(hostname)
        return ip_address
    except socket.gaierror as e:
        raise ValueError(f"Failed to resolve hostname '{hostname}': {e}")


def generate_hosts_file(hostname, slots, use_ip=True, output_file="hosts.txt"):
    """Generate hosts.txt with the specified hostname or IP and number of slots."""
    if use_ip:
        # Resolve IP address
        host = resolve_hostname(hostname)
    else:
        host = hostname

    # Write to hosts.txt
    with open(output_file, "w") as f:
        f.write(f"{host} slots={slots}\n")
    print(f"Generated {output_file}: {host} slots={slots}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate hosts.txt for distributed_run")
    parser.add_argument("--hostname", default="Jethros-MacBook-Air.local",
                        help="Hostname to resolve (default: Jethros-MacBook-Air.local)")
    parser.add_argument("--slots", type=int, default=3,
                        help="Number of slots/processes (default: 3)")
    parser.add_argument("--use-ip", action="store_true", default=True,
                        help="Use IP address instead of hostname")
    parser.add_argument("--output", default="hosts.txt",
                        help="Output file path (default: hosts.txt)")
    args = parser.parse_args()

    try:
        generate_hosts_file(args.hostname, args.slots,
                            args.use_ip, args.output)
    except ValueError as e:
        print(f"Error: {e}")
        exit(1)
