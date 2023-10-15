from django.shortcuts import render
from django.http import JsonResponse
from stock.RSIGoldenCrossStrategy import RSIGoldenCrossStrategy
import yfinance as yf
import pandas as pd
import json

def home(request):
    
    return render(request, 'stock/home.html', locals())

def ajax_data(request):
    
    stock = request.POST['stock']
    start = request.POST['start']
    end = request.POST['end']

    stock = stock + '.TW'
    try:
        stock_data = yf.download(stock, start, end)
        stock_data = stock_data.reset_index()
        stock_data['Date'] = (pd.to_datetime(stock_data['Date']).astype(int) / 10**6).astype(int)
        data = stock_data[['Date', 'Open', 'High', 'Low', 'Close', 'Volume']].values.tolist()

        print(data)
    except:
        pass

    response = {
        'data' : data,
    }
    return JsonResponse(response)

def stockanalyze(request):
    
    return render(request, 'stock/stockanalyze.html', locals())

def stockanalyze_ajax_data(request):
    
    stock = request.POST['stock']
    start = request.POST['start']
    end = request.POST['end']
    short = int(request.POST['short'])
    long = int(request.POST['long'])
    
    try:
        trade,total,rsi1,rsi2 = RSIGoldenCrossStrategy(stock, start, end, short, long)

        trade = trade.to_dict(orient="records")

    except:
        pass

    response = {
        'trade': trade,
        'total': total,
        'rsi1': rsi1,
        'rsi2': rsi2,
     }
    
    return JsonResponse(response)