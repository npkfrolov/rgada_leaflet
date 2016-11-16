/**
 * Created by yellow on 01.11.16.
 */

polygon_table.then(function (json) {
    bigTable = new webix.ui({
            container:"big_table",
            view:"datatable",
            hover:"cell-hover",
            columns:[
                { id:"NumbCat",   header:[{ content:"textFilter", placeholder: "№", height: "46" }],  sort:"int", width: 40},
                { id:"Title",   header:[{ content:"textFilter", placeholder: "Название", height: "46" }], sort:"string", fillspace: 2, minWidth: 150},
                { id:"ArchNumb", header:[{ content:"textFilter", placeholder: "Шифр", height: "46" }], sort:"string", fillspace: 1.5, minWidth: 100},
                { id:"Size", header:[{ content:"textFilter", placeholder: "Размер", height: "46" }], sort:"string", fillspace: true, minWidth: 80},
                { id:"Technique", header:[{ content:"textFilter", placeholder: "Техника", height: "46" }], sort:"string", fillspace: true, minWidth: 80},
                { id:"Watermarks", header:[{ content:"textFilter", placeholder: "Знаки", height: "46" }], sort:"string", fillspace: true, minWidth: 80},
                { id:"Comment", header:[{ content:"textFilter", placeholder: "Комментарии", height: "46" }], sort:"string", fillspace: true, minWidth: 80},
                { id:"DateLow", header:[{ content:"textFilter", placeholder: "От", height: "46" }], sort:"string", width: 40 },
                { id:"DateUpp", header:[{ content:"textFilter", placeholder: "До", height: "46" }], sort:"string", width: 40},
                { id:"Symbols", header:[{ content:"textFilter", placeholder: "Символы", height: "46" }], sort:"string", fillspace: 1.5, minWidth: 150},
                { id:"Text", header:[{ content:"textFilter", placeholder: "Текст", height: "46" }], sort:"string", fillspace: 5, minWidth: 400},
                { id:"TextRev", header:[{ content:"textFilter", placeholder: "Текст обр.", height: "46" }], sort:"string", fillspace: 2, minWidth: 200},
                { id:"Bibliogr", header:[{ content:"textFilter", placeholder: "Библ.", height: "46" }], sort:"string", fillspace: true, minWidth: 80},
                { id:"Details", header:[{ content:"textFilter", placeholder: "Детали", height: "46" }], sort:"string", fillspace: true, minWidth: 80}

            ],
            select:"row",
            fixedRowHeight:false,
            rowLineHeight:25,
            rowHeight:25,
            scrollX:true,
            resizeRow:true,
            css: "table--s",
            on: {
                onAfterLoad: function () {
                    webix.delay(function () {
                        this.adjustRowHeight("Text", true);
                        this.render();
                    }, this);
                },
                onColumnResize: function () {
                    this.adjustRowHeight("Text", true);
                    this.render();
                },
                onItemClick : function() {
                    var item = this.getSelectedItem();
                    $("#big_table-modal").fadeOut();
                    zoomAndShowPopup(item.NumbCat);
                }
            },
            data: json
    });
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
