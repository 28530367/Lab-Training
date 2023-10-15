$.ajaxSetup({
    headers: { 'X-CSRFToken': csrf_token },
    type: 'POST',
});

$(document).ready(function(){

    var datatable1;

    $('#submit').click(function(){
        var ajaxPromise = new Promise(function(resolve) {
            $.ajax({
                url: '/web_tool/ajax_clashfilter/', 
                data: $('#ajax_form').serialize(),
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
                        "data": response.output_data,
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
                    })
                },
                error: function(){
                    alert('something wrong!')
                },  
            });
        });
        
        ajaxPromise.then(function(response) {

        });
    });
});