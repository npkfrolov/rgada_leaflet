/**
 * Created by yellow on 01.11.16.
 */

function sortByNumbCat(a,b){
        var a = parseInt(a.NumbCat);
        var b = parseInt(b.NumbCat);
        return a>b?1:(a<b?-1:0);
}

function oneFilter(value, filter, obj){

    fInt = parseInt(filter)
    if (fInt)
        if ( parseInt(obj.NumbCat)===fInt) return true;

    if (obj.Title.toLowerCase().indexOf(filter)!=-1) return true;
    if (obj.ArchNumb.toLowerCase().indexOf(filter) !== -1) return true;

    return false;
}

function cellContent(obj) {
    return "Title: " + obj.Title + "<br>ArcNumb: " + obj.ArchNumb + "<br>NumCat: " + obj.NumbCat;
}

planTable = new webix.ui({
        container:"plan_table",
        view:"datatable",
        columns:[
            { id:"plans", header:["Чертежи", { content:"textFilter", compare:oneFilter}], sort: sortByNumbCat, fillspace: true, template: cellContent }
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

                    // update data for big data
                    bigTable.data = planTable.data;
                    bigTable.adjust();
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

webix.event(window, "resize", function(){ planTable.adjust(); });