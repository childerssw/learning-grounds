import random
import sys
import math

def check_swaps(puzzle: list[int]) -> bool:
    swaps = 0
    for i in range(1, len(puzzle)):
        swaps +=(sum(a >= b for a,b in (zip(puzzle, puzzle[i:]))))
    
    return (swaps % 2) == 0

def show_puzzle(puzzle: list[list[int]]):
    line = "- " * (3 * len(puzzle) + 1)
    print(line)
    for row in puzzle:
        for number in row:
            if number == -1:
                print('|     ', end='')
            else:
                print(f'| {number:2}  ', end='')
        print('|\n' + line)

def slide_tile(puzzle: list[list[int]]):
    try:
        tile = int(input("Select tile: "))
    except ValueError as _err:
        return
    try:
        i,j = find_tile(puzzle, tile)
    except TypeError as _err:
        return
    swap_tiles(puzzle, i, j)

def find_tile(puzzle: list[list[int]], tile: int) -> tuple[int, int]:
    for i in range(0, len(puzzle)):
        for j in range(0, len(puzzle)):
            if puzzle[i][j] == tile:
                return (i,j)
    return None

def swap_tiles(puzzle: list[list[int]], row: int, col: int):
    i,j = find_tile(puzzle, -1)
    if math.fabs(i-row) + math.fabs(j-col) == 1:
        puzzle[i][j], puzzle[row][col] = puzzle[row][col], puzzle[i][j]

def main():
    try:
        n = int(sys.argv[1])
    except IndexError as _err:
        print("Usage: slide_puzzle.py PUZZLE_SIZE")
        sys.exit(-1)
    except ValueError as _err:
        print(f'{sys.argv[1]} is not a valid number')
        sys.exit(-2)
    
    numbers = [val for val in range(1, n**2)]
    solution = [numbers[i:i+n] for i in range(0,n**2,n)]
    solution[n-1].append(-1)

    random.shuffle(numbers)
    while not check_swaps(numbers):
        random.shuffle(numbers)
    
    numbers.insert(random.randint(0, len(numbers)), -1)

    puzzle = [numbers[i:i+n] for i in range(0,n**2,n)]

    while not solution == puzzle:
        show_puzzle(puzzle)
        slide_tile(puzzle)
    
    show_puzzle(puzzle)
    print('Solved!')


if __name__ == "__main__":
    main()