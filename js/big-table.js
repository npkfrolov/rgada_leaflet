/**
 * Created by yellow on 01.11.16.
 */


bigTable = new webix.ui({
        container:"big_table",
        view:"datatable",
        columns:[
            { id:"Title",   header:["Title", { content:"textFilter"}], sort:"string"},
            { id:"ArchNumb", header:["ArchNumb", { content:"textFilter"}], sort:"string"},
            { id:"NumbCat",   header:["NumbCat", { content:"textFilter"}],  sort:"int"}
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