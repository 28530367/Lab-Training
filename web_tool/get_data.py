import requests
import json
import pandas as pd


def wormbase_crawler(transcript_id):
    response = requests.get(
    'https://wormbase.org/rest/widget/transcript/' + transcript_id + '/sequences',
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 Edg/115.0.1901.203"
    })
    response_data = response.content.decode('utf-8')
    json_data = json.loads(response_data)

    if json_data['fields']['spliced_sequence_context']['data']['strand'] == '+':
        strand = 'positive_strand'
    else:
        strand = 'negative_strand'

    #unspliced
    df_unspliced_features = pd.DataFrame(json_data['fields']['unspliced_sequence_context']['data'][strand]['features'])
    df_unspliced_features['length'] = df_unspliced_features['stop'] - df_unspliced_features['start'] +1
    df_unspliced_features = df_unspliced_features.loc[:,['type', 'start', 'stop', 'length']]

    unspliced_sequence = json_data['fields']['unspliced_sequence_context']['data'][strand]['sequence']

    #spliced
    df_spliced_features = pd.DataFrame(json_data['fields']['spliced_sequence_context']['data'][strand]['features'])
    df_spliced_features['length'] = df_spliced_features['stop'] - df_spliced_features['start'] +1
    df_spliced_features = df_spliced_features.loc[:,['type', 'start', 'stop', 'length']]

    spliced_sequence = json_data['fields']['spliced_sequence_context']['data'][strand]['sequence']

    try:
        translation_sequence = json_data['fields']['protein_sequence']['data']['sequence']
    except:
        translation_sequence = 'non_coding_transcript'

    return df_unspliced_features, unspliced_sequence, df_spliced_features, spliced_sequence, translation_sequence

def get_json(json_file_path):

    with open(json_file_path, "r") as json_file:
        data = json.load(json_file)

    return data