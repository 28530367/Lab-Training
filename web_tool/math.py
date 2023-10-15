import pandas as pd

def utr_cds_ranges(sequence):
    count = 0
    ranges = []
    End = []
    Start = [1]
    five_utr = sequence[0].islower()
    three_utr = sequence[-1].islower()

    if five_utr and three_utr:
        index = [1, 2 ,1]
    elif five_utr:
        index = [1, 2]
    else:
        index = [2, 1]

    first = sequence[0].islower()
    for i in sequence:
        count += 1
        if not first == i.islower():
            first = i.islower()
            End.append(count-1)
            Start.append(count)
        else:
            continue
    End.append(count)

    for i in range(len(Start)):
        ranges.append([Start[i], End[i]])

    return ranges,index

def pirna_svgdata_index_fuction(range_list):
    n = len(range_list)
    row_value = [-1] * n
    index = []

    for i in range_list:
        for y_index, y in enumerate(row_value):
            if i[0] > y:
                index.append(y_index)
                break
            else:
                pass
        row_value[y_index] = i[1]
    return index
