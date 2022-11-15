from multiprocessing import Pool, freeze_support
import time

def split(list_a, chunk_size):
  for i in range(0, len(list_a), chunk_size):
    yield list_a[i:i + chunk_size]

chunk_size = 2
my_list = [1,2,3,4,5,6,7,8,9]
results = list(split(my_list, chunk_size))

print(results) # [[1, 2], [3, 4], [5, 6], [7, 8], [9]]

def work_log(a, b):
    print("A: %s B: %s" % (a, b))
    time.sleep(int(b))
    return a + b

def pool_handler(list_a):
    p = Pool(2)
    results = p.starmap(work_log, list_a)
    print("Results: %s" % (results))

def chunk(list_a):
    for i in range(0, len(list_a)):
        result1 = results[i][0]
        result2 = results[i][1] if len(results[i]) > 1 else 0
        yield (result1, result2)

chunked_results = list(chunk(results)) # [(1, 2), (3, 4), (5, 6), (7, 8), (9,)]

if __name__=="__main__":
    print("chunked_results %s" % chunked_results) 
    pool_handler(chunked_results)
    print("DONE") 
