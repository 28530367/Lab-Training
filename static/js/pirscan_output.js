$.ajaxSetup({
    headers: { 'X-CSRFToken': csrf_token },
    type: 'POST',
});

$(document).ready(function() {
    var ajaxPromise = new Promise(function(resolve) {
        $.ajax({
            url: '/web_tool/ajax_pirscan_output/', 
            success: function(response){
                resolve(response)
                $('#pirscan_table').DataTable({
                    "lengthChange": false, // 關閉 "Show X entries"
                    "searching": false, // 關閉搜索功能
                    "paging":false,
                    data: response.newout_tabledata,
                    columns: [
                        { title: "piRNA" },
                        { title: "piRNA targeting score" },
                        { title: "targeted region in input sequence" },
                        { title: "#mismatches" },
                        { title: "position in piRNA" },
                        { title: "# non-GU mismatches in seed region" },
                        { title: "# GU mismatches in seed region" },
                        { title: "# non-GU mismatches in non-seed region" },
                        { title: "# GU mismatches in non-seed region" },
                        { title: "pairing (top:Input sequence, bottom:piRNA)" },
                    ],
                    "columnDefs": [
                        {
                            "targets": 9, // 第10列
                            "createdCell": function (td, cellData, rowData, row, col) {
                                // 為td添加id
                                $(td).attr('id', 'detail');
                            }
                        }
                    ]
                });
            },
            error: function(){
                alert('something wrong!')
            },  
        }); 
    });
    ajaxPromise.then(function(response) {
        var gene_sequence_svgdata = response.gene_sequence_svgdata
        var pirna_svgdata = response.pirna_svgdata
        var pirna_svgdata_index = response.pirna_svgdata_index
        var gene_sequence_svgcolorindex = response.gene_sequence_svgcolorindex
        var newout_tabledata = response.newout_tabledata

        var maxElement = d3.max(gene_sequence_svgdata, function(d) {
            return d[1];
        });
        
        const tooltip = d3.select(".tooltip");

        // SVG 元素的尺寸
        var svgWidth = 1800;
        var svgHeight = 300;
        
        // 創建 SVG 選擇集
        var pirna_svg = d3.select("#pirna_svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

        // 計算 x 軸的比例尺
        var pirna_xScale = d3.scaleLinear()
        .domain([1, maxElement])
        .range([300, svgWidth-300]);

        // 創建總長度矩形
        pirna_svg.selectAll("rect")
        .data(gene_sequence_svgdata)
        .enter()
        .append("rect")
        .attr("x", function(d, i) { return pirna_xScale(d[0]); }) // 根據數值計算 x 位置
        .attr("y", 50)
        .attr("width", function(d, i) { return pirna_xScale(d[1]) - pirna_xScale(d[0]); })
        .attr("height", 30)
        .attr("fill",function(d, i) { 
            if (gene_sequence_svgcolorindex[i] == 1) {
                return "lightgray";
            } else {
                return "lightblue";
            }
        })
        .attr("stroke", "black") // 添加黑色邊框
        .attr("stroke-width", 1); // 設置邊框寬度為1像素
        
        pirna_svg.selectAll("rect.pirna-rect")
        .data(pirna_svgdata)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            console.log("x: ", d); // 打印 x 的值
            return pirna_xScale(d[0]);
        }) // 根據數值計算 x 位置
        .attr("y", function(d, i) { return 83 + 18 * pirna_svgdata_index[i]; })
        .attr("width", function(d) { return pirna_xScale(d[1]) - pirna_xScale(d[0]); })
        .attr("height", 15)
        .attr("fill", "red")
        .attr("stroke", "black") // 添加黑色邊框
        .attr("stroke-width", 1) // 設置邊框寬度為1像素
        .attr("data-info", function(d, i) {
            var tooltiptable = '<table class="table table-bordered">'
            tooltiptable += '<thead>'
            tooltiptable += '<tr>'
            tooltiptable += '<th>piRNA</th>'
            tooltiptable += '<th>piRNA targeting score</th>'
            tooltiptable += '<th>targeted region in input sequence</th>'
            tooltiptable += '<th># mismatches</th>'
            tooltiptable += '<th>position in piRNA</th>'
            tooltiptable += '<th>pairing (top:Input sequence, bottom:piRNA)</th>'
            tooltiptable += '</tr>'
            tooltiptable += '</thead>'
            tooltiptable += '<tbody>'
            tooltiptable += '<tr>'
            tooltiptable += '<td>' + newout_tabledata[i][0] + '</td>'
            tooltiptable += '<td>' + newout_tabledata[i][1] + '</td>' 
            tooltiptable += '<td>' + newout_tabledata[i][2] + '</td>'
            tooltiptable += '<td>' + newout_tabledata[i][3] + '</td>'
            tooltiptable += '<td>' + newout_tabledata[i][4] + '</td>'
            tooltiptable += '<td>' + newout_tabledata[i][9] + '</td>' 
            tooltiptable += '</tr>'
            tooltiptable += '</tbody>'
            tooltiptable += '</table>'
            return tooltiptable
        })
        .on("mouseover", function() {
            tooltip.style("opacity", 1);
        })
        .on('mousemove', function(event, d){
            var info = d3.select(this).attr("data-info");

            var centerX = window.innerWidth / 5;
            tooltip.style("opacity", 1)
                    .style('left', centerX + 'px')
                    .style('top', 250 + 'px')
                    .html(info)
        })
        // 滑鼠移出事件：隱藏tooltip
        .on("mouseout", function() {
            tooltip.style("opacity", 0);
        }); 

        
        var customTickValues = [1];
        for (var i = 100; i <= maxElement; i += 100) {
            customTickValues.push(i);
        }
        customTickValues.push(maxElement)

         // 創建一個 x 軸生成函數
        var pirna_xAxis = d3.axisTop(pirna_xScale)
            .tickValues(customTickValues);

         // 在 SVG 中創建一個群組元素，用於容納 x 軸
        pirna_svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0, 45)") 
            .call(pirna_xAxis); // 將 x 軸應用到這個群組元素上
    });
});