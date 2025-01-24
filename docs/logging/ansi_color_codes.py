from typing import List

from jet.logger.config import BOLD


def display_ansi_colors_table(cells_per_row: int = 8) -> None:
    """
    Prints ANSI colors as a table, structured to include:
      - Standard Colors
      - High-Intensity Colors
      - 216 Colors
      - Grayscale Colors
    :param cells_per_row: The maximum number of cells per row to display (default is 6).
    """
    reset = "\033[0m"

    def color_code(fg: int, bg: int) -> str:
        return BOLD + f"\033[38;5;{fg};48;5;{bg}m"

    def print_row(codes: List[int]) -> None:
        # Print the row with a maximum of 'cells_per_row' cells
        for i in range(0, len(codes), cells_per_row):
            row = codes[i:i + cells_per_row]
            for code in row:
                fg = contrasting_fg_color(code)
                print(f"{color_code(fg, code)} {code:^3} {reset}", end="  ")
            print()

    print(f"\nDisplaying ANSI Color Table (cells per row: {cells_per_row}):\n")

    # Standard Colors
    print("Standard Colors:")
    print_row(list(range(0, 8)))

    # High-Intensity Colors
    print("\nHigh-Intensity Colors:")
    print_row(list(range(8, 16)))

    # 216 Colors
    print("\n216 Colors:")
    for i in range(0, 216, cells_per_row):
        row = list(range(16 + i, 16 + i + cells_per_row))
        print_row([code for code in row if code != 0])

    # Grayscale Colors
    print("\nGrayscale Colors:")
    print_row(list(range(232, 256)))


def rgb_from_ansi_code(code: int) -> tuple:
    """
    Converts an ANSI color code to RGB values.
    This handles the 256-color palette (16 basic + 216 colors + 24 grayscale colors).
    """
    if 0 <= code < 16:
        # Standard color palette (basic colors)
        basic_colors = [
            (0, 0, 0),      # 0: Black
            (255, 0, 0),    # 1: Red
            (0, 255, 0),    # 2: Green
            (255, 255, 0),  # 3: Yellow
            (0, 0, 255),    # 4: Blue
            (255, 0, 255),  # 5: Magenta
            (0, 255, 255),  # 6: Cyan
            (255, 255, 255),  # 7: White
            (128, 128, 128),  # 8: Bright Black (gray)
            (255, 0, 0),    # 9: Bright Red
            (0, 255, 0),    # 10: Bright Green
            (255, 255, 0),  # 11: Bright Yellow
            (0, 0, 255),    # 12: Bright Blue
            (255, 0, 255),  # 13: Bright Magenta
            (0, 255, 255),  # 14: Bright Cyan
            (255, 255, 255)  # 15: Bright White
        ]
        return basic_colors[code]

    elif 16 <= code < 232:
        # 216 color palette
        code -= 16
        r = (code // 36) * 51
        g = ((code % 36) // 6) * 51
        b = (code % 6) * 51
        return (r, g, b)

    elif 232 <= code < 256:
        # Grayscale (from 232 to 255)
        gray = (code - 232) * 11
        return (gray, gray, gray)


def luminance(rgb: tuple) -> float:
    """
    Calculate the luminance of an RGB color.
    """
    r, g, b = rgb
    r, g, b = r / 255.0, g / 255.0, b / 255.0
    # Apply the luminance formula
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrasting_fg_color(bg: int) -> int:
    """
    Determine the best foreground color (black or white) based on the background color's luminance.
    """
    rgb_bg = rgb_from_ansi_code(bg)
    bg_luminance = luminance(rgb_bg)
    return 15 if bg_luminance < 0.5 else 0


if __name__ == "__main__":
    display_ansi_colors_table()
