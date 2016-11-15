/**
 * Created by yellow on 01.11.16.
 */

function sortByNumbCat(a,b){
        var a = parseInt(a.NumbCat);
        var b = parseInt(b.NumbCat);
        return a>b?1:(a<b?-1:0);
}

planTable = new webix.ui({
        container:"plan_table",
        view:"datatable",
        columns:[

            { id:"plans", header:["Чертежи", { content:"textFilter"}], sort: sortByNumbCat, fillspace: true,
                template:function(obj){return "Title: " + obj.Title + "<br>ArcNumb: " + obj.ArchNumb + "<br>NumCat: " + obj.NumbCat;}
            }
        ],
        select:"row",
        fixedRowHeight:false,
        rowLineHeight:25,
        rowHeight:25,
        scrollX:false,
        on: {
            onAfterLoad: function () {
                webix.delay(function () {
                    this.adjustRowHeight("plans", true);
                    this.render();
                }, this);
            },
            onColumnResize: function () {
                this.adjustRowHeight("plans", true);
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