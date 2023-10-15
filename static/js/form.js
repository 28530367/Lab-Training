$.ajaxSetup({
    headers: { 'X-CSRFToken': csrf_token },
    type: 'POST',
});

$(document).ready(function(){

    var datatable1;
    var datatable2;

    $('#submit').click(function(){

        $.ajax({
            url: '/web_tool/ajax_data/', 
            data: $('#ajax_form').serialize(),
            success: function(response){
                if ( response.message != 'Something wrong, please check again.'){
                    transcript_tabledata = response.transcript_tabledata
                    gene_id_tabledata = response.gene_id_tabledata

                    if (datatable1) {
                        datatable1.destroy();
                        datatable2.destroy();
                    }

                    datatable1 = $('#gene_id_table').DataTable({
                        "lengthChange": false, // 關閉 "Show X entries"
                        "searching": false, // 關閉搜索功能
                        "paging":false,
                        "info": false,
                        "data": gene_id_tabledata,
                        "columns": [
                            { data: 'wormbase_id', title: "Wormbase ID" },
                            { data: 'gene_sequqnce_name', title: "Gene Sequqnce Name" },
                            { data: 'gene_name', title: "Gene Name" },
                            { data: 'other_name', title: "Other Name" },
                        ],
                        createdRow: function (row, data, dataIndex) {
                            $(row).attr('id', data["wormbase_id"]);
                        }
                    });

                    datatable2 = $('#transcript_table').DataTable({
                        "lengthChange": false, // 關閉 "Show X entries"
                        "searching": false, // 關閉搜索功能
                        "paging":false,
                        "info": false,
                        data: transcript_tabledata[0].transcript_id.map(function(transcript_id, index) {
                            var transcriptidlink = '<a href="http://127.0.0.1:8000/web_tool/transcript/?text=' + transcript_id + '">' + transcript_id + '</a>';
                            var siteLink = '<a class="load-page-button" href="http://127.0.0.1:8000/web_tool/pirscan_output/' + transcript_id + '">Site</a>';
                            var bindingiteLink = '<a href="http://127.0.0.1:8000/web_tool/rna_binding_site/?text=' + transcript_id + '">Binding Site</a>';
                            return [transcriptidlink, transcript_tabledata[0].type[index], siteLink, bindingiteLink]; 
                        }),
                        columns: [
                            { title: "Transcript ID" },
                            { title: "Type" },
                            { title: "Site" },
                            { title: "Binding Site" },
                        ],
                        createdRow: function (row, data, dataIndex) {
                            $(row).attr('id', dataIndex);
                        }
                    });

                    // 添加 Site 鏈接的點擊事件處理程序，僅為特殊類別的鏈接添加
                    $(".load-page-button").click(function(event) {
                        event.preventDefault();
                        var targetUrl = $(this).attr("href");
                        console.log("Button clicked!");
                        // 顯示 loading-spinner
                        $("#loading-spinner").show();

                        // 在需要的時間後，進行頁面跳轉
                        setTimeout(function() {
                            // 使用 JavaScript 進行頁面跳轉
                            window.location.href = targetUrl;
                        }, 10);
                        
                    });
                    

                } else {
                    $("#message").html('<div class="alert alert-warning">' + response.message + '</div>');    
                }
                const row = $("#" + response.highlight_id);
                row.css("background-color", "yellow"); // 標記顏色
            },
            error: function(){
                alert('Something error');
            },  
        });
    });

});

