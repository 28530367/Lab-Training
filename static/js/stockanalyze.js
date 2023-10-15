$.ajaxSetup({
    headers: { 'X-CSRFToken': csrf_token },
    type: 'POST',
});

$(document).ready(function(){

    $('#submit').click(function(){
        var ajaxPromise = new Promise(function(resolve) {
            $.ajax({
                url: '/stock/stockanalyze_ajax_data/', 
                data: $('#ajax_form').serialize(),
                success: function(response){
                    console.log(response.rsi1)
                    resolve(response)
                    $('#tradetable').DataTable({
                        "lengthChange": false, // 關閉 "Show X entries"
                        "searching": false, // 關閉搜索功能
                        "paging":false,
                        "info": false,
                        "data": response.trade,
                        "columns": [
                        { data: 'product', title: "股票" },
                        { data: 'bs', title: "買賣" },
                        { data: 'order_time', title: "進場日期" },
                        { data: 'order_price', title: "進場價格" },
                        { data: 'cover_time', title: "出場日期" },
                        { data: 'cover_price', title: "出場價格" },
                        { data: 'order_unit', title: "數量" },
                        ]
                    })
                 
                },
                error: function(){
                    alert('something wrong!')
                },  
            });
        });
        
        ajaxPromise.then(function(response) {
            
            totaldata = [response.total]
            $('#table').DataTable({
                "lengthChange": false, // 關閉 "Show X entries"
                "searching": false, // 關閉搜索功能
                "paging":false,
                "info": false,
                "data": totaldata,
                "columns": [
                { data: '1', title: "總績效" },
                { data: '2', title: "交易次數" },
                { data: '3', title: "平均績效" },
                { data: '4', title: "平均持有天數" },
                { data: '5', title: "勝率" },
                { data: '6', title: "平均獲利" },
                { data: '7', title: "平均虧損" },
                { data: '8', title: "賺賠比" },
                { data: '9', title: "期望值" },
                { data: '10', title: "獲利平均持有天數" },
                { data: '11', title: "虧損平均持有天數" },
                { data: '12', title: "最大連續虧損" },
                { data: '13', title: "最大資金回落" },
                ]
            })
            var rsi1_data = response.rsi1
            var rsi2_data = response.rsi2
            obj = {

                title: {
                    text: 'U.S Solar Employment Growth',
                    align: 'left'
                },
            
                subtitle: {
                    text: 'By Job Category. Source: <a href="https://irecusa.org/programs/solar-jobs-census/" target="_blank">IREC</a>.',
                    align: 'left'
                },
            
                yAxis: {
                    title: {
                        text: 'Number of Employees'
                    }
                },
            
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },
            
                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 0
                    }
                },
            
                series: [{
                    name: '長期RSI',
                    data: rsi2_data
                }, {
                    name: '短期RSI',
                    data: rsi1_data
                }],
            
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }
            
            }
            
            Highcharts.chart('Highchartscontainer', obj);
        });
    });
});
