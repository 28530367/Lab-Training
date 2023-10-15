$(document).ready(function(){
    var urlParams = new URLSearchParams(window.location.search);
    var textParam = urlParams.get('text');

    if (textParam) {
        var ajaxPromise = new Promise(function(resolve) {
            $.ajax({
                url: '/web_tool/ajax_data_transcript/', 
                type: 'GET',
                data: {text: textParam},
                success: function(response){
                    function calculation50(sequence) {
                        count = Math.ceil(sequence/50)
                        sequencecountHTML = ''
                        for (let i = 0; i < count; i++) {
                            sequencecountHTML += '<span>'
                            sequencecountHTML += 1+i*50
                            sequencecountHTML += '<br></span>'
                        }
                        return sequencecountHTML
                    }
                    function calculation20(sequence) {
                        count = Math.ceil(sequence/20)
                        sequencecountHTML = ''
                        for (let i = 0; i < count; i++) {
                            sequencecountHTML += '<span>'
                            sequencecountHTML += 1+i*20
                            sequencecountHTML += '<br></span>'
                        }
                        return sequencecountHTML
                    }
                    let unsplicedtableHTML = '<thead>'
                    unsplicedtableHTML += '<tr>'
                    for (let key = 0; key < Object.keys(response.unspliced_features[0]).length; key++){
                        unsplicedtableHTML += '<th scope="col">'
                        unsplicedtableHTML += Object.keys(response.unspliced_features[0])[key]
                        unsplicedtableHTML += '</th>'
                    }
                    unsplicedtableHTML += '</tr>'
                    unsplicedtableHTML += '</thead>'
                    unsplicedtableHTML += '<tbody>'
                    for (let i = 0; i < response.unspliced_features.length; i++) {
                        unsplicedtableHTML += '<tr>'
                        for (let value = 0; value < Object.values(response.unspliced_features[i]).length; value++){
                            unsplicedtableHTML += '<td>'
                            unsplicedtableHTML += Object.values(response.unspliced_features[i])[value]
                            unsplicedtableHTML += '</td>'
                        }
                        unsplicedtableHTML += '</tr>'
                    }
                    unsplicedtableHTML += '</tbody>'

                    let splicedtableHTML = '<thead>'
                    splicedtableHTML += '<tr>'
                    for (let key = 0; key < Object.keys(response.spliced_features[0]).length; key++){
                        splicedtableHTML += '<th scope="col">'
                        splicedtableHTML += Object.keys(response.spliced_features[0])[key]
                        splicedtableHTML += '</th>'
                    }
                    splicedtableHTML += '</tr>'
                    splicedtableHTML += '</thead>'
                    splicedtableHTML += '<tbody>'
                    for (let i = 0; i < response.spliced_features.length; i++) {
                        splicedtableHTML += '<tr>'
                        for (let value = 0; value < Object.values(response.spliced_features[i]).length; value++){
                            splicedtableHTML += '<td>'
                            splicedtableHTML += Object.values(response.spliced_features[i])[value]
                            splicedtableHTML += '</td>'
                        }
                        splicedtableHTML += '</tr>'
                    }
                    splicedtableHTML += '</tbody>'

                    let unsplicedsequenceHTML = ''
                    let charclass = ''
                    for (let i = 0; i < response.unspliced_sequence.length; i++) {
                        if (response.unspliced_sequence_index[i] == 1) {
                            charclass = 'yellow_background'
                        } else if (response.unspliced_sequence_index[i] == 2) {
                            charclass = 'orange_background'
                        } else if (response.unspliced_sequence_index[i] == 3) {
                            charclass = 'gray_background'
                        } else {
                            charclass = 'no_background'
                        }
                        unsplicedsequenceHTML += '<span class=' + charclass + '>' + response.unspliced_sequence[i] + '</span>'
                    }

                    let splicedsequenceHTML = ''
                    for (let i = 0; i < response.spliced_sequence.length; i++) {
                        if (response.spliced_sequence_index[i] == 1) {
                            charclass = 'yellow_background'
                        } else if (response.spliced_sequence_index[i] == 2) {
                            charclass = 'orange_background'
                        } else if (response.spliced_sequence_index[i] == 3) {
                            charclass = 'gray_background'
                        } else {
                            charclass = 'no_background'
                        }
                        splicedsequenceHTML += '<span class=' + charclass + '>' + response.spliced_sequence[i] + '</span>'
                    }

                    let translationHTML = ''
                    for (let i = 0; i < response.translation.length; i++) {
                        translationHTML += '<span>' + response.translation[i] + '</span>'
                    }

                    let unsplicedsequencecount50HTML = ''
                    let splicedsequencecount50HTML = ''
                    let translationcount50HTML = ''
                    unsplicedsequencecount50HTML = calculation50(response.unspliced_sequence.length)
                    splicedsequencecount50HTML = calculation50(response.spliced_sequence.length)
                    translationcount50HTML = calculation50(response.translation.length)

                    let unsplicedsequencecount20HTML = ''
                    let splicedsequencecount20HTML = ''
                    let translationcount20HTML = ''
                    unsplicedsequencecount20HTML = calculation20(response.unspliced_sequence.length)
                    splicedsequencecount20HTML = calculation20(response.spliced_sequence.length)
                    translationcount20HTML = calculation20(response.translation.length)

                    $("#unsplicedcontents").html(
                        '<div class="containercontents">\
                            <div class="horizontal-divs">\
                                <div>\
                                    <p class="count20">' + unsplicedsequencecount20HTML + '</p>\
                                </div>\
                                <div>\
                                    <p class="count50">' + unsplicedsequencecount50HTML + '</p>\
                                </div>\
                                <div>\
                                    <p class="jss94">' + unsplicedsequenceHTML + '</p>\
                                </div>\
                            </div>\
                            <div class="table-div">\
                                <table class="table table-hover">' + unsplicedtableHTML + '</table><br>\
                            </div>\
                        </div>'
                    );
                    $("#splicedcontents").html(
                        '<div class="containercontents">\
                            <div class="horizontal-divs">\
                                <div>\
                                    <p class="count20">' + splicedsequencecount20HTML + '</p>\
                                </div>\
                                <div>\
                                    <p class="count50">' + splicedsequencecount50HTML + '</p>\
                                </div>\
                                <div>\
                                    <p class="jss94">' + splicedsequenceHTML + '</p>\
                                </div>\
                            </div>\
                            <div class="table-div">\
                                <table class="table table-hover">' + splicedtableHTML + '</table><br>\
                            </div>\
                        </div>'
                    );
                    if (response.translation_check == 1) {
                        $("#translationcontents").html(
                            '<div class="containercontents">\
                                <div class="horizontal-divs">\
                                    <div>\
                                        <p class="count20">' + translationcount20HTML + '</p>\
                                    </div>\
                                    <div>\
                                        <p class="count50">' + translationcount50HTML + '</p>\
                                    </div>\
                                    <div>\
                                        <p class="jss94">' +  translationHTML + '</p>\
                                    </div>\
                                </div>\
                            </div>'
                        );
                    } else {
                        $("#translationcontents").html(
                            '<div class="containercontents">\
                                <div class="horizontal-divs">\
                                    <div>\
                                        <p class="jss94">non_coding_transcript</p>\
                                    </div>\
                                </div>\
                            </div>'
                        );
                    }
                    resolve(response);
                },
                error: function(){
                    alert('Something error');
                },
            });
        });
        ajaxPromise.then(function(response) {
            // 數據
            var unspliced_data = response.unspliced_svg_data;
            var unspliced_index = response.unspliced_svg_index;
            var spliced_exon_data = response.spliced_svg_data;
            var spliced_exon_index = response.spliced_svg_index;
            var unspliced_UTR_data = response.unspliced_svg_UTR_data
            var spliced_UTR_data = response.spliced_svg_UTR_data

            // SVG 元素的尺寸
            var svgWidth = 900;
            var svgHeight = 150;

            const tooltip = d3.select(".tooltip");

            // 創建 SVG 選擇集
            var unsplicedsvg = d3.select("#unspliced-rectangles")
                .attr("width", svgWidth)
                .attr("height", svgHeight);
            var splicedsvg = d3.select("#spliced-rectangles")
                .attr("width", svgWidth)
                .attr("height", svgHeight);

            // 計算 x 軸的比例尺
            var unspliced_xScale = d3.scaleLinear()
                .domain([0, d3.max(unspliced_data)])
                .range([10, svgWidth-10]);
            var spliced_xScale = d3.scaleLinear()
                .domain([0, d3.max(spliced_exon_data)])
                .range([10, svgWidth-10]);

            // 創建 unspliced 矩形
            unsplicedsvg.selectAll("rect")
                .data(unspliced_data)
                .enter()
                .append("rect")
                .attr("x", function(d) { return unspliced_xScale(d); }) // 根據數值計算 x 位置
                .attr("y", 0)
                .attr("width", function(d, i) { 
                    if (i < unspliced_data.length - 1) {
                        // 如果不是最後一個數據，計算與下一個數據的差異作為寬度
                        return unspliced_xScale(unspliced_data[i + 1]) - unspliced_xScale(d);
                    } else {
                        return 0; // 最後一個數據的寬度設為0，或者你可以自行處理
                    }
                })
                .attr("height", svgHeight - 120)
                .attr("fill", function(d, i) {
                    if (unspliced_index[i] == 0) {
                        return "white";
                    } else if (unspliced_index[i] == 1) {
                        return "yellow";
                    } else if (unspliced_index[i] == 2) {
                        return "orange";
                    }
                })
                .attr("data-info", function(d, i) {
                    // 將相關數據添加為自定義數據屬性
                    return "start:" + (d+1) + "<br>stop:" + unspliced_data[i + 1];
                })
                .on("mouseover", function() {
                    tooltip.style("opacity", 1);
                })
                .on('mousemove', function(event, d){
                    var info = d3.select(this).attr("data-info");
                    tooltip.style("opacity", 1)
                            .style('left', (event.layerX + 20) + 'px')
                            .style('top', (event.layerY + 20) + 'px')
                            .html(info)
                })
                // 滑鼠移出事件：隱藏tooltip
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });

            // 創建 unspliced UTR 範圍矩形
            unsplicedsvg.selectAll("rect.utr-rect")
                .data(unspliced_UTR_data)
                .enter()
                .append("rect")
                .attr("class", "utr-rect")
                .attr("x", function (d) { return unspliced_xScale(d[0] - 1); }) // 根據數值計算 x 位置
                .attr("y", 5)
                .attr("width", function (d) {
                return unspliced_xScale(d[1]) - unspliced_xScale(d[0] - 1);
                })
                .attr("height", svgHeight - 130)
                .attr("fill", "gray")
                .attr("data-info", function(d, i) {
                    // 將相關數據添加為自定義數據屬性
                    return "start:" + d[0] + "<br>stop:" + d[1];
                })
                .on("mouseover", function() {
                    tooltip.style("opacity", 1);
                })
                .on('mousemove', function(event, d){
                    var info = d3.select(this).attr("data-info");
                    tooltip.style("opacity", 1)
                            .style('left', (event.layerX + 20) + 'px') // 設定tooltips位置
                            .style('top', (event.layerY + 20) + 'px')
                            .html(info)
                })
                // 滑鼠移出事件：隱藏tooltip
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });

            // 創建 spliced 矩形
            splicedsvg.selectAll("rect")
                .data(spliced_exon_data)
                .enter()
                .append("rect")
                .attr("x", function(d) { return spliced_xScale(d); }) // 根據數值計算 x 位置
                .attr("y", 0)
                .attr("width", function(d, i) { 
                    if (i < spliced_exon_data.length - 1) {
                        return spliced_xScale(spliced_exon_data[i + 1]) - spliced_xScale(d);
                    } else {
                        return 0;
                    }
                })
                .attr("height", svgHeight - 120)
                .attr("fill", function(d, i) {
                    if (spliced_exon_index[i] == 0) {
                        return "white";
                    } else if (spliced_exon_index[i] == 1) {
                        return "yellow";
                    } else if (spliced_exon_index[i] == 2) {
                        return "orange";
                    }
                })
                .attr("data-info", function(d, i) {
                    // 將相關數據添加為自定義數據屬性
                    return "start:" + (d+1) + "<br>stop:" + spliced_exon_data[i + 1];
                })
                .on("mouseover", function() {
                    tooltip.style("opacity", 1);
                })
                .on('mousemove', function(event, d){
                    var info = d3.select(this).attr("data-info");
                    tooltip.style("opacity", 1)
                            .style('left', (event.layerX + 20) + 'px') // 設定tooltips位置
                            .style('top', (event.layerY + 20) + 'px')
                            .html(info)
                })
                // 滑鼠移出事件：隱藏tooltip
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });
                
             // 創建 spliced UTR 範圍矩形
             splicedsvg.selectAll("rect.utr-rect")
                .data(spliced_UTR_data)
                .enter()
                .append("rect")
                .attr("class", "utr-rect")
                .attr("x", function (d) { return spliced_xScale(d[0] - 1); }) // 根據數值計算 x 位置
                .attr("y", 5)
                .attr("width", function (d) {
                return spliced_xScale(d[1]) - spliced_xScale(d[0] - 1);
                })
                .attr("height", svgHeight - 130)
                .attr("fill", "gray")
                .attr("data-info", function(d, i) {
                    // 將相關數據添加為自定義數據屬性
                    return "start:" + d[0] + "<br>stop:" + d[1];
                })
                .on("mouseover", function() {
                    tooltip.style("opacity", 1);
                })
                .on('mousemove', function(event, d){
                    var info = d3.select(this).attr("data-info");
                    tooltip.style("opacity", 1)
                            .style('left', (event.layerX + 20) + 'px') // 設定tooltips位置
                            .style('top', (event.layerY + 20) + 'px')
                            .html(info)
                })
                // 滑鼠移出事件：隱藏tooltip
                .on("mouseout", function() {
                    tooltip.style("opacity", 0);
                });

            // 創建一個 x 軸生成函數
            var unspliced_xAxis = d3.axisBottom(unspliced_xScale);
            var spliced_xAxis = d3.axisBottom(spliced_xScale);

            // 在 SVG 中創建一個群組元素，用於容納 x 軸
            unsplicedsvg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0,40)") // 將 x 軸移到底部
                .call(unspliced_xAxis); // 將 x 軸應用到這個群組元素上
            splicedsvg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0,40)") // 將 x 軸移到底部
                .call(spliced_xAxis); // 將 x 軸應用到這個群組元素上

        });
       
    }

    $("#unsplicedbutton").click(function() {
        $("#unsplicedcontents").slideToggle();
        $("#unsplicedsvg").slideToggle();
    });
    $("#splicedbutton").click(function() {
        $("#splicedcontents").slideToggle();
        $("#splicedsvg").slideToggle();
    });
    $("#translationbutton").click(function() {
        $("#translationcontents").slideToggle();
    });

});