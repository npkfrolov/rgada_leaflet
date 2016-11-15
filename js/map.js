/**
 * Created by Tabletko on 01.11.2016.
 */


var mainMap = L.map('map').setView([55.6, 37], 8),
    popup = $(".object-info"),
    popupInner = popup.find(".object-info__content"),
    overlay = null,
    overlay_hash = null,
    raster_layers = [],
    selected_markers = [],
    centroids,
    markers;

// Change the position of the Zoom Control to a newly created placeholder.
addControlPlaceholders(mainMap);
mainMap.zoomControl.setPosition('verticalcenterleft');

// BaseLayers
var ctrl = L.control.iconLayers(baseLayers).addTo(mainMap);

$.ajax({
    url: point_layer_url,
    dataType: 'JSON',
    success: function(geojson){
        centroids = L.Proj.geoJson(geojson, {
            onEachFeature: function(feature, layer) {
                layer.on({click: onClick});
                layer.on({mouseover: onMouseOver});
                layer.on({mouseout: onMouseOut});
                layer.options.isRasterShown = false;
            }
        });
  		markers = L.markerClusterGroup(
  		    {
                maxClusterRadius: 40
  		    }
        ).addTo(mainMap);
        markers.addLayer(centroids);
    }
});

mainMap.on("click", function(e){
            hideObjectInfo();
        });

$('.js-closePopup').on("click", hidePopup);

$('#raster_opacity').on("change mousewheel", geoRasterOpacity);


function onMouseOver(e) {
    clearOvelay();
    if (!e.target.options.isRasterShown){
        var numCat = this.feature.properties.NumbCat;
        overlay_hash = Math.random();
        showDrawingExtent(numCat, overlay_hash);
    }
}

function onMouseOut(e) {
    overlay_hash = null;
    clearOvelay();
}

function onClick(e) {
    hideObjectInfo();
    showObjectInfo(this.feature.properties.NumbCat, e.target);
}

function showObjectInfo(num, target){
    showPopup(num);
    if (showGeoRaster(num)) target.options.isRasterShown = true;
    highlightIcon(target);
}

function hideObjectInfo(){
    clearOvelay();
    hideGeoRaster();
    hidePopup();
    resetIcons();
}


function highlightIcon(feature){
    var marker = feature._layers[Object.keys(feature._layers)[0]]; //BAD
    selected_markers.push(marker);
    var selIcon =new L.Icon.Default;
    selIcon.options.iconUrl = 'marker-icon-red.png';
    //selIcon.options.iconSize = [40, 50];
    marker.setIcon(selIcon);
}

function resetIcons(){
    $.each(selected_markers, function(index, item){
        item.setIcon(new L.Icon.Default);
    });
    selected_markers = [];
}



function checkStr(str) {
    if (!str || str.length === 0 || /^\s*$/.test(str))
        return 'Нет данных';
    else
        return str;
}

function clearOvelay() {
    if(overlay) {
        mainMap.removeLayer(overlay);
    }
}

function showDrawingExtent(NumbCat, op_overlay_hash) {
    // search in table
    var res = planTable.find(function(row){
        return row.NumbCat == NumbCat;
    });
    var op_overlay_hash = op_overlay_hash;
    if(res.length>0) {
        feat = res[0];
        polygon_id = feat.id;
        url = polygon_layer_url + polygon_id;

        $.ajax({

            url: url,
            dataType: 'JSON',
            success: function(data){
                wkt_geom = data.geom;
                crs3857 = new L.Proj.CRS('EPSG:3857');

                var customLayer = L.geoJson(null, {
                    // http://leafletjs.com/reference.html#geojson-style
                    style: function(feature) {
                        return { color: '#f00' };
                    },
                    coordsToLatLng: function(coords) {
                        var point = L.point(coords[0], coords[1]);
                        return crs3857.projection.unproject(point);
                    }
                });

                overlay = omnivore.wkt.parse(wkt_geom, null, customLayer);
                if(overlay_hash === op_overlay_hash)
                    overlay.addTo(mainMap);
            }
        });
    }
}

function showPopup(numCat) {
    // search in table
    var res = planTable.find(function (row) {
        return row.NumbCat == numCat;
    });
    if (res.length > 0) {
        feat = res[0];
        var popupContent =
            "<div class='object-info__title h1'>" + feat.Title + "</div>" +            
            "<div class='object-info__meta'>Шифр:" + feat.ArchNumb + "</div>" +
            "<div class='object-info__pic-wrapper'>" +
                "<div class='object-info__num'>" + feat.NumbCat + "</div>" +
                "<a class='object-info__pic-link' href='orig/" + feat.NumbCat + "/" + feat.NumbCat + ".jpg' target=_blank><img class='object-info__pic' src='preview/" + feat.NumbCat + "/p" + feat.NumbCat + ".jpg' width='150'></a>" +
            "</div>" +
            "<div class='h2'>Надписи</div> <p>" + feat.Text + "</p>" +
            "<div class='h2'>Надписи на обороте</div> <p>" + checkStr(feat.TextRev)+ "</p>";

        popupInner.empty().html(popupContent);
        popup.addClass("object-info_active");
    }
}

function hidePopup() {    
    popup.removeClass("object-info_active");
    popupInner.empty();
}

function zoomAndShowPopup(numCat) {
    //search point
    var feat = null;
    centroids.eachLayer(function (layer) {
        if ( layer.feature.properties.NumbCat.toString() == numCat) { //TODO: remove .toString();
            feat = layer;
            return;
        }
    });
    if (feat) {
        var center = feat.getBounds().getCenter();
        mainMap.setView(center, 15);

        var marker = feat._layers[Object.keys(feat._layers)[0]];
        markers.zoomToShowLayer(marker);
        showObjectInfo(numCat, feat);
    }
}

function showGeoRaster(numCat) {
// search in table
    var res = planTable.find(function (row) {
        return row.NumbCat == numCat;
    });
    if (res.length > 0) {
        feat = res[0];
        raster_url = feat.URL;

        if (!raster_url || raster_url.length === 0 || /^\s*$/.test(raster_url))
            return;

        raster_layer = L.tileLayer(raster_url, {
            maxZoom: 20,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Rgada</a>'
        });
        raster_layer.addTo(mainMap);
        raster_layers.push(raster_layer);
        showOpacityControl();
    }

    return res.length;
}


function hideGeoRaster() {
    $.each(raster_layers, function(index, item){
        mainMap.removeLayer(item);
    });

    $.each(centroids._layers, function(index, item){
        item.options.isRasterShown = false;
    });

    raster_layers = [];    
    hideOpacityControl();
}

function geoRasterOpacity() {
    var new_opacity = $(this).val();
    var op = new_opacity/100;

    $.each(raster_layers, function(index, item){
        item.setOpacity(op);
    });
}

// show/hide raster opacity control

function showOpacityControl() {
    $(".map-opacity").addClass("map-opacity_active");
}

function hideOpacityControl() {
    $(".map-opacity").removeClass("map-opacity_active");
}

// Create centered Control placeholders
function addControlPlaceholders(map) {
    var corners = map._controlCorners,
        l = 'leaflet-',
        container = map._controlContainer;

    function createCorner(vSide, hSide) {
        var className = l + vSide + ' ' + l + hSide;

        corners[vSide + hSide] = L.DomUtil.create('div', className, container);
    }

    createCorner('verticalcenter', 'left');
    createCorner('verticalcenter', 'right');
}