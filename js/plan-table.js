/**
 * Created by yellow on 01.11.16.
 */

planTable = new webix.ui({
        container:"plan_table",
        view:"datatable",
        columns:[
            { id:"Title",   header:["Title", { content:"textFilter"}], sort:"string", fillspace:2},
            { id:"ArchNumb", header:["ArchNumb", { content:"textFilter"}], sort:"string",  fillspace:1},
            { id:"NumbCat",   header:["NumbCat", { content:"textFilter"}],  sort:"int",  width:80}
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
                zoomAndShowPopup(item.NumbCat);
            }
        },
        url: polygon_table_url
});

webix.event(window, "resize", function(){ planTable.adjust(); })