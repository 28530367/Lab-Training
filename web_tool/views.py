from django.http import JsonResponse
from django.db import connection
from web_tool import models
from django.shortcuts import render
from django.db.models import Q
from django.conf import settings
from .get_data import wormbase_crawler, get_json
from .math import utr_cds_ranges, pirna_svgdata_index_fuction
import pandas as pd
import requests
import json
import os

'''============================================================wormbase_serch============================================================='''
def form(request):

    return render(request, 'gene/form.html', locals())

def ajax_data(request):
    
    gene_id = request.POST['gene_id']
    
    try:
        try:
            Geneotherids = models.Geneid.objects.get(Q(wormbase_id=gene_id) | Q(gene_sequqnce_name=gene_id) | Q(gene_name=gene_id) | Q(other_name=gene_id) | Q(transcript_id__icontains=gene_id))
            wormbase_id = Geneotherids.wormbase_id
            Geneotherids_filter = models.GeneCodingTranscript.objects.filter(wormbase_id=wormbase_id)
        except:
            Geneotherids_II = models.GeneCodingTranscript.objects.get(transcript_id__icontains=gene_id)
            wormbase_id = Geneotherids_II.wormbase_id
            Geneotherids = models.Geneid.objects.get(wormbase_id=wormbase_id)
            Geneotherids_filter = models.GeneCodingTranscript.objects.filter(wormbase_id=wormbase_id)
        
        transcript_id = []
        coding_or_not = []
        for gene_record in Geneotherids_filter:
            transcript_id.append(gene_record.transcript_id)
            coding_or_not.append(gene_record.coding_transcript)

        transcript_tabledata = [{
            'transcript_id': transcript_id,
            'type': coding_or_not,
        }]


        gene_sequqnce_name = Geneotherids.gene_sequqnce_name
        gene_name = Geneotherids.gene_name
        other_name = Geneotherids.other_name

        gene_id_tabledata = [{
            'wormbase_id': wormbase_id,
            'gene_sequqnce_name': gene_sequqnce_name,
            'gene_name': gene_name,
            'other_name': other_name,
        }]

        if gene_id == wormbase_id or gene_id == gene_sequqnce_name or gene_id == gene_name or gene_id == other_name:
            highlight_id = wormbase_id
        else:
            index = transcript_id.index(gene_id)
            highlight_id = index
        message = ''

    except:
        message = 'Something wrong, please check again.'
        highlight_id = ''
        coding_or_not = ''
        transcript_tabledata = ''
        gene_id_tabledata = ''
    
    response = {
        'message': message,
        'highlight_id': highlight_id,
        'coding_or_not': coding_or_not,
        'transcript_tabledata': transcript_tabledata,
        'gene_id_tabledata': gene_id_tabledata,
    }
    return JsonResponse(response)
'''==============================================================transcript==============================================================='''
def transcript(request):
    
    return render(request, 'gene/transcript.html', locals())

def ajax_data_transcript(request):
    
    gene_id = request.GET.get('text', '')
    
    try:

        Gene = models.GeneCodingTranscript.objects.get(transcript_id=gene_id)
        coding_transcript = Gene.coding_transcript

        #get json
        response = requests.get(
            'https://wormbase.org/rest/widget/transcript/' + gene_id + '/sequences',
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
        df_unspliced_svg_data = df_unspliced_features[df_unspliced_features['type'].str.startswith(('exon', 'intron'))].loc[:, 'stop']
        unspliced_svg_data = df_unspliced_svg_data.tolist()
        df_unspliced_features_exon = df_unspliced_features[df_unspliced_features['type'].str.startswith('exon')].copy().reset_index(drop=True)
        df_unspliced_features_UTR = df_unspliced_features[(df_unspliced_features['type'] == 'five_prime_UTR') | (df_unspliced_features['type'] == 'three_prime_UTR')]
        unspliced_svg_UTR_data = df_unspliced_features_UTR[['start', 'stop']].values.tolist()
        unspliced_sequence = json_data['fields']['unspliced_sequence_context']['data'][strand]['sequence']

        unspliced_sequence_index = [0] * len(unspliced_sequence)
        for index, item in df_unspliced_features_exon.iterrows():
            start = item['start'] - 1
            stop = item['stop']
            for i in range(start, stop):
                if index % 2 == 0:
                    unspliced_sequence_index[i] = 1
                else:
                    unspliced_sequence_index[i] = 2

        for index, item in df_unspliced_features_UTR.iterrows():
            start = item['start'] - 1
            stop = item['stop']
            for i in range(start, stop):
                unspliced_sequence_index[i] = 3
        
        exoncount = 1
        introncount = 1

        for index, row in df_unspliced_features.iterrows():
            if row['type'] == 'exon':
                df_unspliced_features.at[index, 'type'] = 'exon{}'.format(exoncount)
                exoncount = exoncount + 1
            elif row['type'] == 'intron':
                df_unspliced_features.at[index, 'type'] = 'intron{}'.format(introncount)
                introncount = introncount + 1
            elif row['type'] == 'five_prime_UTR':
                df_unspliced_features.at[index, 'type'] = '5 UTR'
            elif row['type'] == 'three_prime_UTR':
                df_unspliced_features.at[index, 'type'] = '3 UTR'
            else :
                pass
        
        unspliced_svg_index = [0] * len(unspliced_svg_data)
        colorchange_value = 1
        for i in range(len(unspliced_svg_data)):
            if i % 2 == 0:
                unspliced_svg_index[i] = colorchange_value
                if colorchange_value == 1:
                    colorchange_value = 2
                else:
                    colorchange_value = 1
            else:
                pass

        unspliced_svg_data.insert(0, 0)
        df_unspliced_features = df_unspliced_features.to_dict(orient="records")

        #spliced
        df_spliced_features = pd.DataFrame(json_data['fields']['spliced_sequence_context']['data'][strand]['features'])
        df_spliced_features['length'] = df_spliced_features['stop'] - df_spliced_features['start'] +1
        df_spliced_features = df_spliced_features.loc[:,['type', 'start', 'stop', 'length']]
        df_spliced_svg_data = df_spliced_features[df_spliced_features['type'].str.startswith(('exon', 'intron'))].loc[:, 'stop']
        spliced_svg_data = df_spliced_svg_data.tolist()
        df_spliced_features_exon = df_spliced_features[df_spliced_features['type'].str.startswith('exon')].copy().reset_index(drop=True)
        df_spliced_features_UTR = df_spliced_features[(df_spliced_features['type'] == 'five_prime_UTR') | (df_spliced_features['type'] == 'three_prime_UTR')]
        spliced_svg_UTR_data = df_spliced_features_UTR[['start', 'stop']].values.tolist()
        spliced_sequence = json_data['fields']['spliced_sequence_context']['data'][strand]['sequence']

        spliced_sequence_index = [0] * len(spliced_sequence)
        for index, item in df_spliced_features_exon.iterrows():
            start = item['start'] - 1
            stop = item['stop']
            for i in range(start, stop):
                if index % 2 == 0:
                    spliced_sequence_index[i] = 1
                else:
                    spliced_sequence_index[i] = 2

        for index, item in df_spliced_features_UTR.iterrows():
            start = item['start'] - 1
            stop = item['stop']
            for i in range(start, stop):
                spliced_sequence_index[i] = 3

        exoncount = 1
        introncount = 1

        for index, row in df_spliced_features.iterrows():
            if row['type'] == 'exon':
                df_spliced_features.at[index, 'type'] = 'exon{}'.format(exoncount)
                exoncount = exoncount + 1
            elif row['type'] == 'intron':
                df_spliced_features.at[index, 'type'] = 'intron{}'.format(introncount)
                introncount = introncount + 1
            elif row['type'] == 'five_prime_UTR':
                df_spliced_features.at[index, 'type'] = '5 UTR'
            elif row['type'] == 'three_prime_UTR':
                df_spliced_features.at[index, 'type'] = '3 UTR'
            else :
                pass

        spliced_svg_index = [0] * len(spliced_svg_data)
        for i in range(len(spliced_svg_data)):
            if i % 2 == 0:
                spliced_svg_index[i] = 1
            elif i % 2 == 1:
                spliced_svg_index[i] = 2
            else:
                pass

        spliced_svg_data.insert(0, 0)
        df_spliced_features = df_spliced_features.to_dict(orient="records")

        #translation
        if coding_transcript == 'Coding_transcript':
            translation_sequence = json_data['fields']['protein_sequence']['data']['sequence']
            translation_check = 1
        else:
            translation_sequence = ''
            translation_check = 0
                
    except:
        df_unspliced_features = ''
        unspliced_sequence = ''
        df_spliced_features = ''
        spliced_sequence = ''
        translation_sequence = ''
        unspliced_sequence_index = ''
        spliced_sequence_index = ''
        unspliced_svg_data = ''
        unspliced_svg_index = ''
        spliced_svg_data = ''
        spliced_svg_index = ''
        unspliced_svg_UTR_data = ''
        spliced_svg_UTR_data = ''
        translation_check = ''

    
    response = {
        'transcript_id': gene_id,
        'unspliced_features': df_unspliced_features,
        'unspliced_sequence': unspliced_sequence,
        'spliced_features': df_spliced_features,
        'spliced_sequence':  spliced_sequence,
        'translation': translation_sequence,
        'unspliced_sequence_index': unspliced_sequence_index,
        'spliced_sequence_index': spliced_sequence_index,
        'unspliced_svg_data': unspliced_svg_data,
        'unspliced_svg_index': unspliced_svg_index,
        'spliced_svg_data': spliced_svg_data,
        'spliced_svg_index': spliced_svg_index,
        'unspliced_svg_UTR_data': unspliced_svg_UTR_data,
        'spliced_svg_UTR_data': spliced_svg_UTR_data,
        'translation_check': translation_check,
    }
    return JsonResponse(response)
'''================================================================pirscan================================================================'''
def pirscan_output(request, pk):

    try:
        id = pk
        prinscan_path = settings.PRINSCAN_PATH
        df_unspliced_features, unspliced_sequence, df_spliced_features, spliced_sequence, translation_sequence = wormbase_crawler(id)
        current_address = os.getcwd()
        os.chdir(prinscan_path)
        with open ('inputSeq.fa', 'w') as f:
            f.write('>{}\n' .format(id)+spliced_sequence)
        os.system('python3 piTarPrediction.py inputSeq.fa ce none [0,2,2,3,6]')
        os.chdir(current_address)

    except Exception as error:
        print(error)

    return render(request, 'gene/pirscan_output.html', locals())

def ajax_pirscan_output(request):

    try:
        json_file_path = settings.PRINSCAN_PATH + r'/output/piRNA_targeting_sites.json'
        json_data = get_json(json_file_path)
        
        id = json_data["name"]
        df_unspliced_features, unspliced_sequence, df_spliced_features, spliced_sequence, translation_sequence = wormbase_crawler(id)

        gene_sequence_svgdata, gene_sequence_svgcolorindex = utr_cds_ranges(spliced_sequence)

        json_newout = json_data["newout"]

        columns = [
            "Column 1",
            "Column 2",
            "Column 3",
            "Column 4",
            "Column 5",
            "Column 6",
            "Column 7",
            "Column 8",
            "Column 9",
            "Column 10",
            "Column 11",
            "Column 12",
            "Column 13",
            "Column 14",
            "Column 15"
        ]

        df_json_newout = pd.DataFrame(json_newout, columns=columns)

        df_json_newout["Column 2"] = df_json_newout["Column 2"].apply(lambda x: [int(val) for val in x.split('-')]) 
        df_json_newout_sorted = df_json_newout.sort_values(by="Column 2", key=lambda x: x.str[0])

        pirna_svgdata = df_json_newout_sorted["Column 2"].tolist()

        pirna_svgdata_index = pirna_svgdata_index_fuction(pirna_svgdata)

        # 遍歷數據，將第8列和第9列的內容合併並插入<br>
        df_json_newout_sorted['Column 10'] = df_json_newout_sorted.apply(lambda row: f"{row['Column 10']}<br>{row['Column 11']}", axis=1)

        df_json_newout_sorted['Column 2'] = df_json_newout_sorted['Column 2'].apply(lambda lst: f"{lst[0]}-{lst[1]}")

        json_newout_tabledata = df_json_newout_sorted[["Column 1", "Column 15", "Column 2", "Column 3", "Column 4", "Column 6", "Column 7", "Column 8", "Column 9", "Column 10" ]].values.tolist()
        
    except Exception as error:
        print(error)

    response = {
        "newout_tabledata": json_newout_tabledata,
        "gene_sequence_svgdata": gene_sequence_svgdata,
        "gene_sequence_svgcolorindex": gene_sequence_svgcolorindex,
        "pirna_svgdata": pirna_svgdata,
        "pirna_svgdata_index": pirna_svgdata_index,
    }
    return JsonResponse(response)
'''==============================================================clashfilter=============================================================='''
def clashfilter(request):

    return render(request, 'gene/clashfilter.html', locals())

def ajax_clashfilter(request):

    sql_clashfilter = models.Clashfilter.objects.all()
    df_clashfilter = pd.DataFrame(list(sql_clashfilter.values()))

    genelistInput = request.POST['genelistInput']
    gene_lines = genelistInput.splitlines()
    miRNAlistInput = request.POST['miRNAlistInput']
    miRNA_lines = miRNAlistInput.splitlines()
    readcount_mode = float(request.POST['readcount_mode'])
    readcount = float(request.POST['readcount'])
    RNAup_min_energy_mode = float(request.POST['RNAup_min_energy_mode'])
    RNAup_min_energy = float(request.POST['RNAup_min_energy'])
    RNAup_max_energy_mode = float(request.POST['RNAup_max_energy_mode'])
    RNAup_max_energy = float(request.POST['RNAup_max_energy'])
    miranda_min_energy_mode = float(request.POST['miranda_min_energy_mode'])
    miranda_min_energy = float(request.POST['miranda_min_energy'])
    miranda_max_energy_mode = float(request.POST['miranda_max_energy_mode'])
    miranda_max_energy = float(request.POST['miranda_max_energy'])

    gene_name_query = Q()
    for gene_id in gene_lines:
        gene_name_query |= Q(gene_name = gene_id)

    gene_result = models.Geneid.objects.filter(gene_name_query)
    gene_result_values = [row.transcript_id for row in gene_result]

    result_list = []
    if gene_lines:
        for item in gene_result_values:
            cleaned_item = item.strip("[]").replace("'", "").split(", ")
            result_list.extend(cleaned_item)
    else:
        pass

    if result_list and miRNA_lines:
        df_output_data = df_clashfilter[df_clashfilter['targetrnaname'].isin(result_list) & df_clashfilter['smallrnaname'].isin(miRNA_lines)]
    elif result_list:
        df_output_data = df_clashfilter[df_clashfilter['targetrnaname'].isin(result_list)]
    elif miRNA_lines:
        df_output_data = df_clashfilter[df_clashfilter['smallrnaname'].isin(miRNA_lines)]
    else:
        df_output_data = df_clashfilter
    
    
    def get_row(dataframe, column, mode, value):

        if mode == 1:
            output = dataframe[dataframe[column] > value]
        elif mode == 2:
            output = dataframe[dataframe[column] < value]
        elif mode == 3:
            output = dataframe[dataframe[column] == value] 
        else:
            output = dataframe
        return output
    
    df_output_data = get_row(df_output_data, 'readcount', readcount_mode, readcount)
    df_output_data = get_row(df_output_data, 'rnaupscore', RNAup_min_energy_mode, RNAup_min_energy)
    df_output_data = get_row(df_output_data, 'rnaupmaxscore', RNAup_max_energy_mode, RNAup_max_energy)
    df_output_data = get_row(df_output_data, 'mirandaenergy', miranda_min_energy_mode, miranda_min_energy)
    df_output_data = get_row(df_output_data, 'mirandamaxenergy', miranda_max_energy_mode, miranda_max_energy)

    # print(df_output_data)

    def RNAup_regulator_sequence(df, column1, column2):
        df[column1] = df[column1].apply(lambda x: x.replace('T', 'U'))
        df[column2] = df[column2].apply(lambda x: x.replace('T', 'U'))

        for index, row in df.iterrows():
            first_sequence = row[column1]
            second_sequence = row[column2]
            
            new_target_sequence = ""
            new_regulator_sequence = ""
            
            for char1, char2 in zip(first_sequence, second_sequence):
                if (char1 == 'G' and char2 == 'U') or (char1 == 'U' and char2 == 'G'):
                    new_target_sequence += "<mark id='b'>" + char2 + "</mark>"
                    new_regulator_sequence += char1
                elif (char1 == 'A' and char2 == 'U') or (char1 == 'U' and char2 == 'A') or (char1 == 'C' and char2 == 'G') or (char1 == 'G' and char2 == 'U') or (char1 == '-' and char2 == '-'):
                    new_target_sequence += char2
                    new_regulator_sequence += char1
                elif char1 == '-':
                    new_target_sequence += "<mark id='g'>" + char2 + "</mark>"
                    new_regulator_sequence += "<span class='dash'>" + char1 + "</span>"
                elif char2 == '-':
                    new_target_sequence += "<span class='dash'>" + char2 + "</span>"
                    new_regulator_sequence += "<mark id='g'>" + char1 + "</mark>"
                else:
                    new_target_sequence += "<mark id='y'>" + char2 + "</mark>"
                    new_regulator_sequence += char1

            df.at[index, column1] = new_regulator_sequence
            df.at[index, column2] = new_target_sequence
            
        df[column1][df[column1] != '-'] = "5' " + df[column1][df[column1] != '-'] + " 3'"
        df[column2][df[column2] != '-'] = "3' " + df[column2][df[column2] != '-'] + " 5'"

        df[column1] = df.apply(lambda row: f"{row[column1]}<br>{row[column2]}", axis=1)

        return df
    
    df_output_data = RNAup_regulator_sequence(df_output_data, 'rnaupmaxregulatorsequence', 'rnaupmaxtargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'rnaupregulatorsequence', 'rnauptargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'mirandaregulatorsequence', 'mirandatargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'mirandamaxregulatorsequence', 'mirandamaxtargetsequence')

    output_data = df_output_data.to_dict(orient="records")

    # print(output_data)

    response = {
        'output_data': output_data,
    }
    return JsonResponse(response)
'''===========================================================rna_binding_site============================================================'''
def rna_binding_site(request):

    return render(request, 'gene/rna_binding_site.html', locals())

def ajax_rna_binding_site(request):

    sql_clashfilter = models.Clashfilter.objects.all()
    df_clashfilter = pd.DataFrame(list(sql_clashfilter.values()))

    transcrip_id = [request.GET.get('text', '')]

    df_unspliced_features, unspliced_sequence, df_spliced_features, spliced_sequence, translation_sequence = wormbase_crawler(transcrip_id[0])

    gene_sequence_svgdata, gene_sequence_svgcolorindex = utr_cds_ranges(spliced_sequence)
    
    df_output_data = df_clashfilter[df_clashfilter['targetrnaname'].isin(transcrip_id)]

    def RNAup_regulator_sequence(df, column1, column2):
        df[column1] = df[column1].apply(lambda x: x.replace('T', 'U'))
        df[column2] = df[column2].apply(lambda x: x.replace('T', 'U'))

        for index, row in df.iterrows():
            first_sequence = row[column1]
            second_sequence = row[column2]
            
            new_target_sequence = ""
            new_regulator_sequence = ""
            
            for char1, char2 in zip(first_sequence, second_sequence):
                if (char1 == 'G' and char2 == 'U') or (char1 == 'U' and char2 == 'G'):
                    new_target_sequence += "<mark id='b'>" + char2 + "</mark>"
                    new_regulator_sequence += char1
                elif (char1 == 'A' and char2 == 'U') or (char1 == 'U' and char2 == 'A') or (char1 == 'C' and char2 == 'G') or (char1 == 'G' and char2 == 'U') or (char1 == '-' and char2 == '-'):
                    new_target_sequence += char2
                    new_regulator_sequence += char1
                elif char1 == '-':
                    new_target_sequence += "<mark id='g'>" + char2 + "</mark>"
                    new_regulator_sequence += "<span class='dash'>" + char1 + "</span>"
                elif char2 == '-':
                    new_target_sequence += "<span class='dash'>" + char2 + "</span>"
                    new_regulator_sequence += "<mark id='g'>" + char1 + "</mark>"
                else:
                    new_target_sequence += "<mark id='y'>" + char2 + "</mark>"
                    new_regulator_sequence += char1

            df.at[index, column1] = new_regulator_sequence
            df.at[index, column2] = new_target_sequence
            
        df[column1][df[column1] != '-'] = "5' " + df[column1][df[column1] != '-'] + " 3'"
        df[column2][df[column2] != '-'] = "3' " + df[column2][df[column2] != '-'] + " 5'"

        df[column1] = df.apply(lambda row: f"{row[column1]}<br>{row[column2]}", axis=1)

        return df

    df_output_data = RNAup_regulator_sequence(df_output_data, 'rnaupmaxregulatorsequence', 'rnaupmaxtargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'rnaupregulatorsequence', 'rnauptargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'mirandaregulatorsequence', 'mirandatargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'mirandamaxregulatorsequence', 'mirandamaxtargetsequence')

    df_output_data["targetrnaregionfoundinclashread"] = df_output_data["targetrnaregionfoundinclashread"].apply(lambda x: [int(val) for val in x.split('-')]) 
    df_output_data_sorted = df_output_data.sort_values(by="targetrnaregionfoundinclashread", key=lambda x: x.str[0])

    miranda_svgdata = df_output_data_sorted["targetrnaregionfoundinclashread"].tolist()

    miranda_svgdata_index = pirna_svgdata_index_fuction(miranda_svgdata)

    df_output_data_sorted["targetrnaregionfoundinclashread"] = df_output_data_sorted["targetrnaregionfoundinclashread"].apply(lambda lst: f"{lst[0]}-{lst[1]}")

    output_data_sorted = df_output_data_sorted.to_dict(orient="records")

    miRNA = df_output_data_sorted['smallrnaname']
    miRNA = miRNA.drop_duplicates()
    miRNA = miRNA.tolist()

    print(miRNA)
    response = {
        "output_data_sorted": output_data_sorted,
        "gene_sequence_svgdata": gene_sequence_svgdata,
        "gene_sequence_svgcolorindex": gene_sequence_svgcolorindex,
        "miranda_svgdata": miranda_svgdata,
        "miranda_svgdata_index": miranda_svgdata_index,
        "miRNA": miRNA,
    }

    return JsonResponse(response)

def ajax_rna_binding_site_search(request):

    sql_clashfilter = models.Clashfilter.objects.all()
    df_clashfilter = pd.DataFrame(list(sql_clashfilter.values()))

    transcrip_id = [request.GET.get('text', '')]
    selectedValues = request.GET.get('selected', '')
    selectedValues = selectedValues.split(', ')
    print(selectedValues)

    df_unspliced_features, unspliced_sequence, df_spliced_features, spliced_sequence, translation_sequence = wormbase_crawler(transcrip_id[0])

    gene_sequence_svgdata, gene_sequence_svgcolorindex = utr_cds_ranges(spliced_sequence)
    
    df_output_data = df_clashfilter[df_clashfilter['targetrnaname'].isin(transcrip_id)]
    if selectedValues:
        df_output_data = df_output_data[df_output_data['smallrnaname'].isin(selectedValues)]

    def RNAup_regulator_sequence(df, column1, column2):
        df[column1] = df[column1].apply(lambda x: x.replace('T', 'U'))
        df[column2] = df[column2].apply(lambda x: x.replace('T', 'U'))

        for index, row in df.iterrows():
            first_sequence = row[column1]
            second_sequence = row[column2]
            
            new_target_sequence = ""
            new_regulator_sequence = ""
            
            for char1, char2 in zip(first_sequence, second_sequence):
                if (char1 == 'G' and char2 == 'U') or (char1 == 'U' and char2 == 'G'):
                    new_target_sequence += "<mark id='b'>" + char2 + "</mark>"
                    new_regulator_sequence += char1
                elif (char1 == 'A' and char2 == 'U') or (char1 == 'U' and char2 == 'A') or (char1 == 'C' and char2 == 'G') or (char1 == 'G' and char2 == 'U') or (char1 == '-' and char2 == '-'):
                    new_target_sequence += char2
                    new_regulator_sequence += char1
                elif char1 == '-':
                    new_target_sequence += "<mark id='g'>" + char2 + "</mark>"
                    new_regulator_sequence += "<span class='dash'>" + char1 + "</span>"
                elif char2 == '-':
                    new_target_sequence += "<span class='dash'>" + char2 + "</span>"
                    new_regulator_sequence += "<mark id='g'>" + char1 + "</mark>"
                else:
                    new_target_sequence += "<mark id='y'>" + char2 + "</mark>"
                    new_regulator_sequence += char1

            df.at[index, column1] = new_regulator_sequence
            df.at[index, column2] = new_target_sequence
            
        df[column1][df[column1] != '-'] = "5' " + df[column1][df[column1] != '-'] + " 3'"
        df[column2][df[column2] != '-'] = "3' " + df[column2][df[column2] != '-'] + " 5'"

        df[column1] = df.apply(lambda row: f"{row[column1]}<br>{row[column2]}", axis=1)

        return df

    df_output_data = RNAup_regulator_sequence(df_output_data, 'rnaupmaxregulatorsequence', 'rnaupmaxtargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'rnaupregulatorsequence', 'rnauptargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'mirandaregulatorsequence', 'mirandatargetsequence')
    df_output_data = RNAup_regulator_sequence(df_output_data, 'mirandamaxregulatorsequence', 'mirandamaxtargetsequence')

    df_output_data["targetrnaregionfoundinclashread"] = df_output_data["targetrnaregionfoundinclashread"].apply(lambda x: [int(val) for val in x.split('-')]) 
    df_output_data_sorted = df_output_data.sort_values(by="targetrnaregionfoundinclashread", key=lambda x: x.str[0])

    miranda_svgdata = df_output_data_sorted["targetrnaregionfoundinclashread"].tolist()

    miranda_svgdata_index = pirna_svgdata_index_fuction(miranda_svgdata)

    df_output_data_sorted["targetrnaregionfoundinclashread"] = df_output_data_sorted["targetrnaregionfoundinclashread"].apply(lambda lst: f"{lst[0]}-{lst[1]}")

    output_data_sorted = df_output_data_sorted.to_dict(orient="records")

    response = {
        "output_data_sorted": output_data_sorted,
        "gene_sequence_svgdata": gene_sequence_svgdata,
        "gene_sequence_svgcolorindex": gene_sequence_svgcolorindex,
        "miranda_svgdata": miranda_svgdata,
        "miranda_svgdata_index": miranda_svgdata_index,
    }

    return JsonResponse(response)