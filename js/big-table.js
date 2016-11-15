/**
 * Created by yellow on 01.11.16.
 */


bigTable = new webix.ui({
        container:"big_table",
        view:"datatable",
        hover:"cell-hover",
        columns:[
            { id:"NumbCat",   header:[{ content:"textFilter", placeholder: "№ по каталогу", height: "68" }],  sort:"int", width:80},
            { id:"Title",   header:[{ content:"textFilter", placeholder: "Название", height: "68" }], sort:"string", fillspace: true},
            { id:"ArchNumb", header:[{ content:"textFilter", placeholder: "Шифр", height: "68" }], sort:"string", fillspace: true},
            { id:"Size", header:[{ content:"textFilter", placeholder: "Размер", height: "68" }], sort:"string", width: 105 },
            { id:"Technique", header:[{ content:"textFilter", placeholder: "Техника", height: "68" }], sort:"string", width: 108 },
            { id:"Watermarks", header:[{ content:"textFilter", placeholder: "Знаки", height: "68" }], sort:"string", fillspace: true},
            { id:"Comment", header:[{ content:"textFilter", placeholder: "Комментарии", height: "68" }], sort:"string", fillspace: true},
            { id:"DateLow", header:[{ content:"textFilter", placeholder: "От", height: "68" }], sort:"string", width: 90 },
            { id:"DateUpp", header:[{ content:"textFilter", placeholder: "До", height: "68" }], sort:"string", width: 90 },
            { id:"Symbols", header:[{ content:"textFilter", placeholder: "Символы", height: "68" }], sort:"string", fillspace: true},
            { id:"Text", header:[{ content:"textFilter", placeholder: "Текст", height: "68" }], sort:"string", fillspace: true},
            { id:"TextRev", header:[{ content:"textFilter", placeholder: "Текст обр.", height: "68" }], sort:"string", fillspace: true},
            { id:"Bibliogr", header:[{ content:"textFilter", placeholder: "Библ.", height: "68" }], sort:"string", fillspace: true},
            { id:"Details", header:[{ content:"textFilter", placeholder: "Детали", height: "68" }], sort:"string", fillspace: true}

        ],
        select:"row",
        fixedRowHeight:false,
        rowLineHeight:25,
        rowHeight:25,
        scrollX:false,
        on: {
            onAfterLoad: function () {
                webix.delay(function () {
                    this.adjustRowHeight("Title", true);
                    this.render();
                }, this);
            },
            onColumnResize: function () {
                this.adjustRowHeight("Title", true);
                this.render();
            },
            onItemClick : function() {
                var item = this.getSelectedItem();
                $("#big_table-modal").fadeOut();
                zoomAndShowPopup(item.NumbCat);
            }
        },
        url: polygon_table_url

});

webix.event(window, "resize", function(){ bigTable.adjust(); });


(function(){
    /* Open big table */
     $("[data-open-modal=big_table-modal]").on("click", function(e){
        setTimeout(function(){
           bigTable.adjust();
       }, 200)
        
     });
})();