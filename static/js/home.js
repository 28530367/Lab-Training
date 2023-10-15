$.ajaxSetup({
    headers: { 'X-CSRFToken': csrf_token },
    type: 'POST',
});

$(document).ready(function(){

    $('#submit').click(function(){
        var ajaxPromise = new Promise(function(resolve) {
            $.ajax({
                url: '/stock/ajax_data/', 
                data: $('#ajax_form').serialize(),
                success: function(response){
                    resolve(response)
                },
                error: function(){
                    alert('something wrong!')
                },  
            });
        });
        
        ajaxPromise.then(function(response) {
            
            data = response.data

            var ohlc = [],
                volume = [],
                dataLength = data.length,
                // set the allowed units for data grouping
                groupingUnits = [[
                    'week',                         // unit name
                    [1]                             // allowed multiples
                ], [
                    'month',
                    [1, 2, 3, 4, 6]
                ]],

                i = 0;

            for (i; i < dataLength; i += 1) {
                ohlc.push([
                    data[i][0], // the date
                    data[i][1], // open
                    data[i][2], // high
                    data[i][3], // low
                    data[i][4] // close
                ]);

                volume.push([
                    data[i][0], // the date
                    data[i][5] // the volume
                ]);
            }
            obj = {

                rangeSelector: {
                    selected: 1
                },
        
                title: {
                    text: 'Stock'
                },
        
                yAxis: [{
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'OHLC'
                    },
                    height: '60%',
                    lineWidth: 2,
                    resize: {
                        enabled: true
                    }
                }, {
                    labels: {
                        align: 'right',
                        x: -3
                    },
                    title: {
                        text: 'Volume'
                    },
                    top: '65%',
                    height: '35%',
                    offset: 0,
                    lineWidth: 2
                }],
        
                tooltip: {
                    split: true
                },
        
                series: [{
                    type: 'candlestick',
                    name: 'stock',
                    data: ohlc,
                    dataGrouping: {
                        units: groupingUnits
                    }
                }, {
                    type: 'column',
                    name: 'Volume',
                    data: volume,
                    yAxis: 1,
                    dataGrouping: {
                        units: groupingUnits
                    }
                }]
            };
                            
            Highcharts.stockChart('message',obj);
        });
    });
});
