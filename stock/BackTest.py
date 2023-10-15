# 載入必要套件
import lineTool
import mplfinance as mpf
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# 繪製蠟燭圖


def ChartCandle(data, addp=[]):
    mcolor = mpf.make_marketcolors(up='r', down='g', inherit=True)
    mstyle = mpf.make_mpf_style(base_mpf_style='yahoo', marketcolors=mcolor)
    mpf.plot(data, addplot=addp, style=mstyle, type='candle', volume=True,)

# 繪製交易記錄圖


def ChartTrade(data, trade=pd.DataFrame(), addp=[], v_enable=True):
    addp = addp.copy()
    data1 = data.copy()
    # 如果有交易紀錄，則把交易紀錄與K線彙整
    if trade.shape[0] > 0:
        # 將物件複製出來，不影響原本的交易明細變數
        trade1 = trade.copy()
        # 取出進場明細，透過時間索引將資料合併
        buy_order_trade = trade1.iloc[:, [2, 3]]
        buy_order_trade = buy_order_trade.set_index('order_time')
        buy_order_trade.columns = ['buy_order']
        buy_order_trade = buy_order_trade.drop_duplicates()
        # 取出出場明細，透過時間索引將資料合併
        buy_cover_trade = trade1.iloc[:, [4, 5]]
        buy_cover_trade = buy_cover_trade.set_index('cover_time')
        buy_cover_trade.columns = ['buy_cover']
        buy_cover_trade = buy_cover_trade.drop_duplicates()
        # 將交易紀錄與K線資料彙整
        data1 = pd.concat([data1, buy_order_trade, buy_cover_trade], axis=1)

        # 將交易紀錄透過副圖的方式繪製
        addp.append(mpf.make_addplot(
            data1['buy_order'], type='scatter', color='#FF4500', marker='^', markersize=50))
        addp.append(mpf.make_addplot(
            data1['buy_cover'], type='scatter', color='#16982B', marker='v', markersize=50))
    # 繪製圖表
    mcolor = mpf.make_marketcolors(up='r', down='g', inherit=True)
    mstyle = mpf.make_mpf_style(base_mpf_style='yahoo', marketcolors=mcolor)
    mpf.plot(data1, addplot=addp, style=mstyle, type='candle', volume=v_enable, savefig='/home/ubuntu/Lab_Training/django/Lab_Training/static/image/chart.png')

# 計算交易績效指標


def Performance(trade=pd.DataFrame(), prodtype='ETF'):
    # 如果沒有交易紀錄 則不做接下來的計算
    if trade.shape[0] == 0:
        print('沒有交易紀錄')
        return False

    # 交易成本 手續費0.1425%*2 (券商打折請自行計算)
    if prodtype == 'ETF':
        cost = 0.001 + 0.00285    # ETF稅金 0.1%
    elif prodtype == 'Stock':
        cost = 0.003 + 0.00285    # 股票的稅金 0.3%
    else:
        return False

    # 將物件複製出來，不影響原本的變數內容
    trade1 = trade.copy()
    trade1 = trade1.sort_values(by=trade1.columns[4])  # 依欄位名稱排序
    trade1 = trade1.reset_index(drop=True)

    trade1.columns = ['product', 'bs', 'order_time',
                      'order_price', 'cover_time', 'cover_price', 'order_unit']
    # 計算出每筆的報酬率，出場價-進場價/進場價-成本
    trade1['ret'] = (((trade1['cover_price']-trade1['order_price']) /
                     trade1['order_price'])-cost) * trade1['order_unit']

    # 1.	總報酬率：整個回測期間的總報酬率累加
    # print('總績效 %s ' % (round(trade1['ret'].sum(), 4)))

    # 2.	總交易次數：代表回測的交易筆數
    # print('交易次數 %s ' % (trade1.shape[0]))

    # 3.	平均報酬率：簡單平均報酬率（扣除交易成本後）
    # print('平均績效 %s ' % (round(trade1['ret'].mean(), 4)))

    # 4.    平均持有時間：代表平均每筆交易的持有時間
    onopen_day = (trade1['cover_time']-trade1['order_time']).mean()
    # print('平均持有天數 %s 天' % (onopen_day.days))
    earn_trade = trade1[trade1['ret'] > 0]
    loss_trade = trade1[trade1['ret'] <= 0]
    if earn_trade.shape[0] == 0 or loss_trade.shape[0] == 0:
        print('交易資料樣本不足(樣本中需要賺有賠的)')
        return False

    # 5.	勝率：代表在交易次數中，獲利次數的佔比（扣除交易成本後）
    earn_ratio = earn_trade.shape[0] / trade1.shape[0]
    # print('勝率 %s ' % (round(earn_ratio, 2)))

    # 6.	平均獲利：代表平均每一次獲利的金額（扣除交易成本後）
    avg_earn = earn_trade['ret'].mean()
    # print('平均獲利 %s ' % (round(avg_earn, 4)))

    # 7.	平均虧損：代表平均每一次虧損的金額（扣除交易成本後）
    avg_loss = loss_trade['ret'].mean()
    # print('平均虧損 %s ' % (round(avg_loss, 4)))

    # 8.	賺賠比：代表平均獲利 / 平均虧損，獲利一次可以虧損幾次
    odds = abs(avg_earn/avg_loss)
    # print('賺賠比 %s ' % (round(odds, 4)))

    # 9.	期望值：代表每投入的金額，可能會回報的多少倍的金額，勝率*賺賠比/1-勝率 ??
    # print('期望值 %s ' % (round(((earn_ratio*odds)-(1-earn_ratio)), 4)))

    # 10.	獲利平均持有時間：代表獲利平均每筆交易的持有時間
    earn_onopen_day = (earn_trade['cover_time'] -
                       earn_trade['order_time']).mean()
    # print('獲利平均持有天數 %s 天' % (earn_onopen_day.days))

    # 11.	虧損平均持有時間：代表虧損平均每筆交易的持有時間
    loss_onopen_day = (loss_trade['cover_time'] -
                       loss_trade['order_time']).mean()
    # print('虧損平均持有天數 %s 天' % (loss_onopen_day.days))

    # 12.	最大連續虧損：代表連續虧損的最大幅度
    tmp_accloss = 1
    max_accloss = 1
    for ret in trade1['ret'].values:  # 報酬率判斷是否虧損
        if ret <= 0:
            tmp_accloss *= ret
            max_accloss = min(max_accloss, tmp_accloss)
        else:
            tmp_accloss = 1
    # print('最大連續虧損', round(max_accloss, 4))

    # 優先計算累計報酬率 並將累計報酬率的初始值改為1
    trade1['acc_ret'] = (1+trade1['ret']).cumprod()  # 累乘
    trade1.loc[-1, 'acc_ret'] = 1  # 最後一列新增acc_ret為1，其他項為空值
    trade1.index = trade1.index + 1  # index加1，並且重新排序
    trade1.sort_index(inplace=True)

    # 13.	最大資金回落：代表資金從最高點回落至最低點的幅度
    trade1['acc_max_cap'] = trade1['acc_ret'].cummax()  # 由上到下比較，顯示出最大的
    # 累計報酬率/歷史最大報酬率 = 累計報酬率回檔的比例，因此當dd等於1，表示權益創新高
    trade1['dd'] = (trade1['acc_ret'] / trade1['acc_max_cap'])
    # 新增一行new_high，如果acc_ret=acc_max_cap，值為acc_ret，如果不相等，值為nan
    trade1.loc[trade1['acc_ret'] == trade1['acc_max_cap'],
               'new_high'] = trade1['acc_ret']
    # print('最大資金回落', round(1-trade1['dd'].min(), 4))
    # print(trade1)
    # 14.	繪製資金曲線圖(用幾何報酬計算)
    ax = plt.subplot(111)
    ax.plot(trade1['acc_ret'], 'b-', label='Profit')
    ax.plot(trade1['dd'], '-', color='#00A600', label='MDD')
    ax.plot(trade1['new_high'], 'o', color='#FF0000', label='Equity high')
    ax.legend()
    plt.show()

    total = {'1': round(trade1['ret'].sum(), 4),
             '2': trade1.shape[0],
             '3': round(trade1['ret'].mean(), 4),
             '4': onopen_day.days,
             '5': round(earn_ratio, 2),
             '6': round(avg_earn, 4),
             '7': round(avg_loss, 4),
             '8': round(odds, 4),
             '9': round(((earn_ratio*odds)-(1-earn_ratio)), 4),
             '10': earn_onopen_day.days,
             '11': loss_onopen_day.days,
             '12': round(max_accloss, 4),
             '13': round(1-trade1['dd'].min(), 4)}

    return total
