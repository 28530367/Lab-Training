$(document).ready(function(){

    var urlParams = new URLSearchParams(window.location.search);
    var textParam = urlParams.get('text');
    var datatable1;
    var selectedOptions = {};  // 跟蹤已選擇的選項
    var ajaxPromise = new Promise(function(resolve) {
        $.ajax({
            url: '/web_tool/ajax_rna_binding_site/', 
            type: 'GET',
            data: {text: textParam},
            success: function(response){
                resolve(response)

                if (datatable1) {
                    datatable1.destroy();
                }

                datatable1 = $('#interactionstable').DataTable({
                    "lengthChange": false, // 關閉 "Show X entries"
                    "searching": false, // 關閉搜索功能
                    "scrollX": true,  // 啟用水平滾動
                    "scrollY": '70vh',  // 設置垂直滾動高度，可以更改為您需要的值
                    "scrollCollapse": true,  // 如果內容不足，則隱藏滾動條
                    "paging": false,  // 禁用分頁（如果不需要的話）
                    "data": response.output_data_sorted,
                    "columns": [
                    { data: 'clashread', title: "CLASH Read" },
                    { data: 'readcount', title: "read count" },
                    { data: 'smallrnaname', title: "miRNA" },
                    { data: 'targetrnaname', title: "mRNA" },
                    { data: 'regiononclashreadidentifiedastargetrna', title: "CLASH identified region" },
                    { data: 'targetrnaregionfoundinclashread', title: "Target RNA Region in CLASH" },
                    { data: 'rnaupmaxregulatorsequence', title: "RNAup Max Regulator sequence" },
                    { data: 'rnaupmaxbindingsite', title: "RNAup Max binding site" },
                    { data: 'rnaupmaxscore', title: "RNAup Max score" },
                    { data: 'rnaupregulatorsequence', title: "RNAup Regulator sequence" },
                    { data: 'rnaupbindingsite', title: "RNAup binding site" },
                    { data: 'rnaupscore', title: "RNAup score" },
                    { data: 'mirandaenergy', title: "Miranda energy" },
                    { data: 'mirandascore', title: "Miranda score" },
                    { data: 'mirandabindingsite', title: "Miranda binding site" },
                    { data: 'mirandaregulatorsequence', title: "Miranda pairing sequence" },
                    { data: 'mirandamaxenergy', title: "Miranda Max energy" },
                    { data: 'mirandamaxscore', title: "Miranda Max score" },
                    { data: 'mirandamaxbindingsite', title: "Miranda Max binding site" },
                    { data: 'mirandamaxregulatorsequence', title: "Miranda Max pairing sequence" },
                    ],
                    "columnDefs": [
                        {
                            "targets": [6, 9, 15, 19],
                            "createdCell": function (td, cellData, rowData, row, col) {
                                $(td).addClass('sequence');
                            }
                        }
                    ],
                });

                var form = $("#myForm"); // 取得表單元素

                $.each(response.miRNA, function (index, labelText) {
                    var label = $("<label></label>"); // 建立 <label> 元素
                    label.text(labelText); // 設定 <label> 元素的文字內容

                    var input = $("<input type='checkbox' />"); // 建立 <input> 元素，設定類型為文字
                    input.attr('id', labelText); // 設定 id，你可以自訂 id 名稱
                    input.attr('name', labelText); // 設定 name，這裡使用相同的 name
                    input.attr('value', labelText); // 設定 value，這裡將其設定為 labelText 的值
                    
                    // 將 <label> 和 <input> 加入表單
                    form.append(input);
                    form.append(label);
                    form.append("<br>");
                });

            },
            error: function(){
                alert('something wrong!')
            },  
        });
    });
    
    ajaxPromise.then(function(response) {
        var gene_sequence_svgdata = response.gene_sequence_svgdata
        var miranda_svgdata = response.miranda_svgdata
        var miranda_svgdata_index = response.miranda_svgdata_index
        var gene_sequence_svgcolorindex = response.gene_sequence_svgcolorindex
        var output_data_sorted = response.output_data_sorted
        console.log(output_data_sorted)
        const tooltip = d3.select(".tooltip");

        var maxElement = d3.max(gene_sequence_svgdata, function(d) {
            return d[1];
        });

        // SVG 元素的尺寸
        var svgWidth = 2000;
        var svgHeight = 300;
        
        // 創建 SVG 選擇集
        var miranda_svg = d3.select("#miranda_svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

        // 計算 x 軸的比例尺
        var miranda_xScale = d3.scaleLinear()
        .domain([1, maxElement])
        .range([300, svgWidth-300]);

        // 創建總長度矩形
        miranda_svg.selectAll("rect")
        .data(gene_sequence_svgdata)
        .enter()
        .append("rect")
        .attr("x", function(d, i) { return miranda_xScale(d[0]); }) // 根據數值計算 x 位置
        .attr("y", 50)
        .attr("width", function(d, i) { return miranda_xScale(d[1]) - miranda_xScale(d[0]); })
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
        
        miranda_svg.selectAll("rect.miranda-rect")
        .data(miranda_svgdata)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            console.log("x: ", d); // 打印 x 的值
            return miranda_xScale(d[0]);
        }) // 根據數值計算 x 位置
        .attr("y", function(d, i) { return 83 + 18 * miranda_svgdata_index[i]; })
        .attr("width", function(d) { return miranda_xScale(d[1]) - miranda_xScale(d[0]); })
        .attr("height", 15)
        .attr("fill", "red")
        .attr("stroke", "black") // 添加黑色邊框
        .attr("stroke-width", 1) // 設置邊框寬度為1像素
        .attr("data-info", function(d, i) {
            var tooltiptable = '<table class="table table-bordered">'
            tooltiptable += '<thead>'
            tooltiptable += '<tr>'
            tooltiptable += '<th>CLASH Read</th>'
            tooltiptable += '<th>read count</th>'
            tooltiptable += '<th>miRNA</th>'
            tooltiptable += '<th>mRNA</th>'
            tooltiptable += '<th>Target RNA Region in CLASH</th>'
            tooltiptable += '</tr>'
            tooltiptable += '</thead>'
            tooltiptable += '<tbody>'
            tooltiptable += '<tr>'
            tooltiptable += '<td>' + output_data_sorted[i]['clashread'] + '</td>'
            tooltiptable += '<td>' + output_data_sorted[i]['readcount'] + '</td>' 
            tooltiptable += '<td>' + output_data_sorted[i]['smallrnaname'] + '</td>'
            tooltiptable += '<td>' + output_data_sorted[i]['targetrnaname'] + '</td>'
            tooltiptable += '<td>' + output_data_sorted[i]['targetrnaregionfoundinclashread'] + '</td>' 
            tooltiptable += '</tr>'
            tooltiptable += '</tbody>'
            tooltiptable += '<thead>'
            tooltiptable += '<tr>'
            tooltiptable += '<th>RNAup binding site</th>'
            tooltiptable += '<th>RNAup score</th>'
            tooltiptable += '<th>RNAup Regulator sequence</th>'
            tooltiptable += '</tr>'
            tooltiptable += '</thead>'
            tooltiptable += '<tbody>'
            tooltiptable += '<tr>'
            tooltiptable += '<td>' + output_data_sorted[i]['rnaupbindingsite'] + '</td>'
            tooltiptable += '<td>' + output_data_sorted[i]['rnaupscore'] + '</td>' 
            tooltiptable += '<td class="sequence">' + output_data_sorted[i]['rnaupregulatorsequence'] + '</td>' 
            tooltiptable += '</tr>'
            tooltiptable += '</tbody>'
            tooltiptable += '<thead>'
            tooltiptable += '<tr>'
            tooltiptable += '<th>Miranda binding site</th>'
            tooltiptable += '<th>Miranda energy</th>'
            tooltiptable += '<th>Miranda pairing sequence</th>'
            tooltiptable += '</tr>'
            tooltiptable += '</thead>'
            tooltiptable += '<tbody>'
            tooltiptable += '<tr>'
            tooltiptable += '<td>' + output_data_sorted[i]['mirandabindingsite'] + '</td>' 
            tooltiptable += '<td>' + output_data_sorted[i]['mirandaenergy'] + '</td>'
            tooltiptable += '<td class="sequence">' + output_data_sorted[i]['mirandaregulatorsequence'] + '</td>'
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
                    .style('top', 1050 + 'px')
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
        var miranda_xAxis = d3.axisTop(miranda_xScale)
            .tickValues(customTickValues);

         // 在 SVG 中創建一個群組元素，用於容納 x 軸
        miranda_svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0, 45)") 
            .call(miranda_xAxis); // 將 x 軸應用到這個群組元素上
    });

    $('#myForm').on('change', function() {
        var selectedValues = []; // 用來存儲被勾選的值的陣列
        $("input[type='checkbox']").each(function() {
            if ($(this).prop('checked')) {
                selectedValues.push($(this).val()); // 把被勾選的值添加到陣列中
            }
        });
        var selectedValuesStr = selectedValues.join(', ');
        console.log(selectedValuesStr);

        var ajaxPromise = new Promise(function(resolve) {
            $.ajax({
                url: '/web_tool/ajax_rna_binding_site_search/', 
                type: 'GET',
                data: {
                    text: textParam, 
                    selected: selectedValuesStr,
                },
                success: function(response){
                    resolve(response)
    
                    if (datatable1) {
                        datatable1.destroy();
                    }
    
                    datatable1 = $('#interactionstable').DataTable({
                        "lengthChange": false, // 關閉 "Show X entries"
                        "searching": false, // 關閉搜索功能
                        "scrollX": true,  // 啟用水平滾動
                        "scrollY": '70vh',  // 設置垂直滾動高度，可以更改為您需要的值
                        "scrollCollapse": true,  // 如果內容不足，則隱藏滾動條
                        "paging": false,  // 禁用分頁（如果不需要的話）
                        "data": response.output_data_sorted,
                        "columns": [
                        { data: 'clashread', title: "CLASH Read" },
                        { data: 'readcount', title: "read count" },
                        { data: 'smallrnaname', title: "miRNA" },
                        { data: 'targetrnaname', title: "mRNA" },
                        { data: 'regiononclashreadidentifiedastargetrna', title: "CLASH identified region" },
                        { data: 'targetrnaregionfoundinclashread', title: "Target RNA Region in CLASH" },
                        { data: 'rnaupmaxregulatorsequence', title: "RNAup Max Regulator sequence" },
                        { data: 'rnaupmaxbindingsite', title: "RNAup Max binding site" },
                        { data: 'rnaupmaxscore', title: "RNAup Max score" },
                        { data: 'rnaupregulatorsequence', title: "RNAup Regulator sequence" },
                        { data: 'rnaupbindingsite', title: "RNAup binding site" },
                        { data: 'rnaupscore', title: "RNAup score" },
                        { data: 'mirandaenergy', title: "Miranda energy" },
                        { data: 'mirandascore', title: "Miranda score" },
                        { data: 'mirandabindingsite', title: "Miranda binding site" },
                        { data: 'mirandaregulatorsequence', title: "Miranda pairing sequence" },
                        { data: 'mirandamaxenergy', title: "Miranda Max energy" },
                        { data: 'mirandamaxscore', title: "Miranda Max score" },
                        { data: 'mirandamaxbindingsite', title: "Miranda Max binding site" },
                        { data: 'mirandamaxregulatorsequence', title: "Miranda Max pairing sequence" },
                        ],
                        "columnDefs": [
                            {
                                "targets": [6, 9, 15, 19],
                                "createdCell": function (td, cellData, rowData, row, col) {
                                    $(td).addClass('sequence');
                                }
                            }
                        ],
                    });
                    
                },
                error: function(){
                    alert('something wrong!')
                },  
            });
        });
        
        ajaxPromise.then(function(response) {

            var $svgElement = $('svg');
            
            $svgElement.remove();

            var gene_sequence_svgdata = response.gene_sequence_svgdata
            var miranda_svgdata = response.miranda_svgdata
            var miranda_svgdata_index = response.miranda_svgdata_index
            var gene_sequence_svgcolorindex = response.gene_sequence_svgcolorindex
            var output_data_sorted = response.output_data_sorted
            const tooltip = d3.select(".tooltip");
    
            var maxElement = d3.max(gene_sequence_svgdata, function(d) {
                return d[1];
            });
    
            // SVG 元素的尺寸
            var svgWidth = 2000;
            var svgHeight = 300;
            
            // 創建 SVG 選擇集
            var miranda_svg = d3.select("#svg")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
    
            // 計算 x 軸的比例尺
            var miranda_xScale = d3.scaleLinear()
            .domain([1, maxElement])
            .range([300, svgWidth-300]);
    
            // 創建總長度矩形
            miranda_svg.selectAll("rect")
            .data(gene_sequence_svgdata)
            .enter()
            .append("rect")
            .attr("x", function(d, i) { return miranda_xScale(d[0]); }) // 根據數值計算 x 位置
            .attr("y", 50)
            .attr("width", function(d, i) { return miranda_xScale(d[1]) - miranda_xScale(d[0]); })
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
            
            miranda_svg.selectAll("rect.miranda-rect")
            .data(miranda_svgdata)
            .enter()
            .append("rect")
            .attr("x", function(d) {
                console.log("x: ", d); // 打印 x 的值
                return miranda_xScale(d[0]);
            }) // 根據數值計算 x 位置
            .attr("y", function(d, i) { return 83 + 18 * miranda_svgdata_index[i]; })
            .attr("width", function(d) { return miranda_xScale(d[1]) - miranda_xScale(d[0]); })
            .attr("height", 15)
            .attr("fill", "red")
            .attr("stroke", "black") // 添加黑色邊框
            .attr("stroke-width", 1) // 設置邊框寬度為1像素
            .attr("data-info", function(d, i) {
                var tooltiptable = '<table class="table table-bordered">'
                tooltiptable += '<thead>'
                tooltiptable += '<tr>'
                tooltiptable += '<th>CLASH Read</th>'
                tooltiptable += '<th>read count</th>'
                tooltiptable += '<th>miRNA</th>'
                tooltiptable += '<th>mRNA</th>'
                tooltiptable += '<th>Target RNA Region in CLASH</th>'
                tooltiptable += '</tr>'
                tooltiptable += '</thead>'
                tooltiptable += '<tbody>'
                tooltiptable += '<tr>'
                tooltiptable += '<td>' + output_data_sorted[i]['clashread'] + '</td>'
                tooltiptable += '<td>' + output_data_sorted[i]['readcount'] + '</td>' 
                tooltiptable += '<td>' + output_data_sorted[i]['smallrnaname'] + '</td>'
                tooltiptable += '<td>' + output_data_sorted[i]['targetrnaname'] + '</td>'
                tooltiptable += '<td>' + output_data_sorted[i]['targetrnaregionfoundinclashread'] + '</td>' 
                tooltiptable += '</tr>'
                tooltiptable += '</tbody>'
                tooltiptable += '<thead>'
                tooltiptable += '<tr>'
                tooltiptable += '<th>RNAup binding site</th>'
                tooltiptable += '<th>RNAup score</th>'
                tooltiptable += '<th>RNAup Regulator sequence</th>'
                tooltiptable += '</tr>'
                tooltiptable += '</thead>'
                tooltiptable += '<tbody>'
                tooltiptable += '<tr>'
                tooltiptable += '<td>' + output_data_sorted[i]['rnaupbindingsite'] + '</td>'
                tooltiptable += '<td>' + output_data_sorted[i]['rnaupscore'] + '</td>' 
                tooltiptable += '<td class="sequence">' + output_data_sorted[i]['rnaupregulatorsequence'] + '</td>' 
                tooltiptable += '</tr>'
                tooltiptable += '</tbody>'
                tooltiptable += '<thead>'
                tooltiptable += '<tr>'
                tooltiptable += '<th>Miranda binding site</th>'
                tooltiptable += '<th>Miranda energy</th>'
                tooltiptable += '<th>Miranda pairing sequence</th>'
                tooltiptable += '</tr>'
                tooltiptable += '</thead>'
                tooltiptable += '<tbody>'
                tooltiptable += '<tr>'
                tooltiptable += '<td>' + output_data_sorted[i]['mirandabindingsite'] + '</td>' 
                tooltiptable += '<td>' + output_data_sorted[i]['mirandaenergy'] + '</td>'
                tooltiptable += '<td class="sequence">' + output_data_sorted[i]['mirandaregulatorsequence'] + '</td>'
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
                        .style('top', 1050 + 'px')
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
            var miranda_xAxis = d3.axisTop(miranda_xScale)
                .tickValues(customTickValues);
    
             // 在 SVG 中創建一個群組元素，用於容納 x 軸
            miranda_svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0, 45)") 
                .call(miranda_xAxis); // 將 x 軸應用到這個群組元素上
        });
    });
});