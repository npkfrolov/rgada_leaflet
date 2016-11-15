/**
 * Created by yellow on 01.11.16.
 */


bigTable = new webix.ui({
        container:"big_table",
        view:"datatable",
        hover:"cell-hover",
        columns:[
            { id:"Title",   header:[{ content:"textFilter", placeholder: "Название" }], sort:"string"},
            { id:"ArchNumb", header:[{ content:"textFilter", placeholder: "Шифр" }], sort:"string"},
            { id:"NumbCat",   header:[{ content:"textFilter", placeholder: "№ по каталогу" }],  sort:"int"}
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
                //TODO: hide this!
                zoomAndShowPopup(item.NumbCat);
            }
        },
        data: []
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