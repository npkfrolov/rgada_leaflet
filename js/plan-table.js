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
    var template = 
        "<div class='plan-table__title h2'>" + obj.Title + "</div>" +
        "<div class='plan-table__meta'>" + obj.ArchNumb + "</div>" +
        "<div class='plan-table__num'>" +  + obj.NumbCat + "</div>";
    return template;
}

planTable = new webix.ui({
        container:"plan_table",
        view:"datatable",
        columns:[
            { id:"plans", header: { content:"textFilter", compare:oneFilter, placeholder: "Искать чертеж", height: "68"}, sort: sortByNumbCat, fillspace: true, template: cellContent }
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