from functools import partial
from itertools import repeat
from multiprocessing import Pool, freeze_support
import time

def func(a, b, c):
    print("A: %s B: %s C: %s" % (a, b, c))
    time.sleep(int(c))
    return b + c

def main():
    p = Pool(2)
    results = p.starmap(func, [("A", 0, 5), ("B", 3, 2), ("C", 4, 1), ("D", 2, 3)])
    print("Results: %s" % (results))

if __name__=="__main__":
    # freeze_support()
    main()