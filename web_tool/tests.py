import pandas as pd

regulator_sequence = [
    "UCGUGCCUUUGUAUACAUGCCCAC",
    "UGAUCGAA------AGUGC--UACUAGAGU",
    "AAGCCAUUGCGAAGUCACAGUAU",
    "UUGUACCUAUCCUCGAUGCCCAU",
    "UACCUUUGUGGUUGCUGCAUAAU",
    "UCGUGCCUUUGUAUACAUGCCCAC",
    "-",
    "ACUUCUCUCG-CGGAGGUACUGU",
    "UUGUACCUAUCCUCGAU----GCCCAU",
    "UAACGGCAUGACUUGCUAGAGU",
    "AGUCGAUACGGUUG--UAGAACGGA",
    "UAACGGCAUGACUUGCUAGAGU",
    "AGCGUAGAUGACUCGGAUGGAGU"
]

target_sequence = [
    "GTCAAGGAAACATT-ACACGGGAT",
    "GAGAGCTTCTATCATTGCGTTATGATCTCA",
    "GTAAAGAATGCGGATGTGTCATG",
    "ACTCTGGATCAAAAGGGTATTGA",
    "CTCGTACTTCTAATGATGAAACA",
    "CGCACTTGGAACCATCTCTCTCTCTC",
    "-",
    "ACTATCTACAGCATCAATGATCTCA",
    "ATCGCCGTGTTGAAGATCTCAC",
    "GGCTTAATTTGATATATTGTT",
    "CATGTATTTTCTTCGAACCAAAGA",
    "TCCCGTTCCACATACATTCCA",
    "CCTCATCT-TTG-TCCTACCTCA"
]

# 創建DataFrame
df = pd.DataFrame({'RNAup regulator_sequence': regulator_sequence, 'RNAup target_sequence': target_sequence})

df['RNAup regulator_sequence'] = df['RNAup regulator_sequence'].apply(lambda x: x.replace('T', 'U'))
df['RNAup target_sequence'] = df['RNAup target_sequence'].apply(lambda x: x.replace('T', 'U'))

# 遍歷每一行，根據條件進行替換操作
for index, row in df.iterrows():
    first_sequence = row['RNAup regulator_sequence']
    second_sequence = row['RNAup target_sequence']
    
    # 初始化一個空字符串來構建替換後的目標序列
    new_target_sequence = ""
    new_regulator_sequence = ""
    
    # 遍歷第一列和第二列的字符
    for char1, char2 in zip(first_sequence, second_sequence):
        if (char1 == 'G' and char2 == 'U') or (char1 == 'U' and char2 == 'G'):
            new_target_sequence += "<mark id='b'>" + char2 + "</mark>"
            new_regulator_sequence += char1
        elif (char1 == 'A' and char2 == 'U') or (char1 == 'U' and char2 == 'A') or (char1 == 'C' and char2 == 'G') or (char1 == 'G' and char2 == 'U') or (char1 == '-' and char2 == '-'):
            new_target_sequence += char2
            new_regulator_sequence += char1
        elif char1 == '-':
            new_target_sequence += "<mark id='g'>" + char2 + "</mark>"
            new_regulator_sequence += char1
        elif char2 == '-':
            new_target_sequence += char2
            new_regulator_sequence += "<mark id='g'>" + char1 + "</mark>"
        else:
            new_target_sequence += "<mark id='y'>" + char2 + "</mark>"
            new_regulator_sequence += char1

    # 更新DataFrame中的目標序列
    df.at[index, 'RNAup regulator_sequence'] = new_regulator_sequence
    df.at[index, 'RNAup target_sequence'] = new_target_sequence

df['RNAup regulator_sequence'][df.apply(lambda row: '-' not in row.values, axis=1)] = "5' " + df['RNAup regulator_sequence'][df.apply(lambda row: '-' not in row.values, axis=1)] + " 3'"
df['RNAup target_sequence'][df.apply(lambda row: '-' not in row.values, axis=1)] = "3' " + df['RNAup target_sequence'][df.apply(lambda row: '-' not in row.values, axis=1)] + " 5'"

df['RNAup regulator_sequence'] = df.apply(lambda row: f"{row['RNAup regulator_sequence']}<br>{row['RNAup target_sequence']}", axis=1)

# print(df['RNAup regulator_sequence'])

miRNA_lines = ''

if miRNA_lines:
    print('1')
else:
    print('2')

    # 初始字符串列表
initial_list = ["['T13A10.10a.1']", "['F54D12.3.1']", "['C50F2.9.1']", "['ZK993.1a.1', 'ZK993.1b.1']"]

# 創建一個空列表來存儲處理後的值
result_list = []

# 使用迴圈遍歷初始列表
for item in initial_list:
    # 使用字符串操作去除方括号和單引號，然後使用 split 分割字符串
    cleaned_item = item.strip("[]").replace("'", "").split(", ")
    # 將處理後的值擴展到結果列表
    result_list.extend(cleaned_item)

# 現在，result_list 包含了處理後的值
print(result_list)