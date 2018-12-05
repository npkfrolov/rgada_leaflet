/**
 * Created by Tabletko on 01.11.2016.
 */

var mapLayersCache = {
    region_boundaries: {
        name: "Административные границы",
        layersControl: true,
        order: 1,
        url: region_boundaries_layer_url,
        featureLayers: [], // Array<feature: Feature, layer: Marker>
        group: L.featureGroup(),
        featureFilter: function (feature) {
            return true;
        },
        isLoaded: false
    },
    region_centers: {
        name: "Административные центры",
        layersControl: true,
        order: 2,
        url: region_centers_layer_url,
        featureLayers: [], // Array<feature: Feature, layer: Marker>
        group: L.featureGroup(),
        pointToLayer: function (feature, latlng) {
            return L.circle(latlng);
        },
        featureFilter: function (feature) {
            return true;
        },
        isLoaded: false
    },
    point_layer: {
        order: 3,
        url: point_layer_url,
        featureLayers: [], // Array<feature: Feature, layer: Marker>
        group: L.markerClusterGroup({
            maxClusterRadius: 40
        }),
        onEachFeature: function (feature, layer) {
            layer.on({ click: onClick });
            layer.on({ mouseover: onMouseOver });
            layer.on({ mouseout: onMouseOut });
            layer.options.isRasterShown = false;
        },
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: defIcon });
        },
        featureFilter: function (feature) {
            return true;
        },
        isLoaded: false
    }
};

var orderedCache = []

var updateLayersOrder = function () {
    for (var c in mapLayersCache) {
        if (mapLayersCache.hasOwnProperty(c)) {
            orderedCache.push(mapLayersCache[c]);
        }
    }
    orderedCache.sort(function (a, b) {
        return a.order - b.order;
    });
}
updateLayersOrder();



var mainMap = L.map('map').setView([55.6, 37], 8),
    popup = $(".object-info"),
    popupInner = popup.find(".object-info__content"),
    overlay = null,
    overlay_hash = null,
    raster_layers = [],
    selected_markers = [],
    centroids,
    markers,
    infoLayers = [],
    defIcon = L.icon({
        iconUrl: './img/leaflet/marker-icon.png',
        iconSize: [28, 40],
        iconAnchor: [13, 40]
    }),
    selIcon = L.icon({
        iconUrl: './img/leaflet/marker-icon-red.png',
        iconSize: [28, 40],
        iconAnchor: [13, 40]
    });

for (var fry = 0; fry < orderedCache.length; fry++) {
    var m = orderedCache[fry];
    if (m.layersControl) {
        infoLayers.push({name: m.name || m.url, layer: m.group});
    }
}

// Change the position of the Zoom Control to a newly created placeholder.
addControlPlaceholders(mainMap);
mainMap.zoomControl.setPosition('verticalcenterleft');

// BaseLayers
L.control.scale({ imperial: false, position: 'bottomright' }).addTo(mainMap);
L.control.mousePosition({ position: 'bottomright' }).addTo(mainMap);
var ctrl = L.control.iconLayers(baseLayers, {
    maxLayersInRow: 1
}).addTo(mainMap);

//Info Layers
infoLayers.forEach(function (layer) {
    layer.layer.addTo(mainMap);
});

// Menu control
var menuControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        container.innerHTML = "<a class='menu-control toggle-control active' href='#'><svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>" +
            "<path d='M0 0h24v24H0z' fill='none'/>" +
            "<path d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'/>" +
            "</svg></a>";

        $(container).find(".menu-control").on("click", function (e) {
            e.stopPropagation();
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(".right-panel.active").each(function () {
                    hideRightPanel($(this));
                });
            } else {
                $(this).addClass("active");
                showRightPanel($(".object-list"));
            }
        });

        return container;
    }
});

mainMap.addControl(new menuControl());

// About control
var aboutControl = L.Control.extend({
    options: {
        position: 'upperbottomright'
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        container.innerHTML = "<a class='about-control' href='#'>?</a>";

        $(container).find(".about-control").on("click", function (e) {
            e.stopPropagation();
            if ($(".about").hasClass("active")) {
                hideRightPanel($(".about"));
            } else {
                showRightPanel($(".about"));
            }
        });

        return container;
    }
});

mainMap.addControl(new aboutControl());


// Layer control
var layerControl = L.Control.extend({
    options: {
        position: 'bottomleft'
    },
    onAdd: function (map) {
        var that = this,
            container = L.DomUtil.create('div', 'leaflet-bar leaflet-control layer-control');
        container.innerHTML = "";

        this.options.layers.forEach(function (layer, index) {
            container.innerHTML += "<div class='layer-control__layer'><label class='checkbox' for='layer-" + index + "'>\
                                 <input type='checkbox' id='layer-" + index + "' checked class='layer-checkbox'  data-layer-id='" + index + "' data-active>\
                                 <span class='checkbox__icon'></span> <span class='checkbox__label'>" + layer.name + "</span>\
                                </label></div>";
        });

        L.DomEvent.disableClickPropagation(container);

        $(container).find(".layer-checkbox").on("click", function (e) {
            var isActive = this.hasAttribute('data-active'),
                layerId = this.getAttribute('data-layer-id');

            if (isActive) {
                mainMap.removeLayer(that.options.layers[layerId].layer)
                this.removeAttribute('data-active');
            }
            else {
                that.options.layers[layerId].layer.addTo(mainMap);
                this.setAttribute('data-active', true);
            }

        });

        return container;
    }
});
mainMap.addControl(new layerControl({ layers: infoLayers }));

var loadlayerGeojson = function (name) {
    var mem = mapLayersCache[name];
    $.ajax({
        url: mem.url,
        dataType: 'JSON',
        success: function (geojson) {
            centroids = L.Proj.geoJson(geojson, {
                onEachFeature: function (feature, layer) {
                    if (mem.onEachFeature) {
                        mem.onEachFeature(feature, layer);
                    }
                    mem.featureLayers.push({ feature: feature, layer: layer });
                    mem.group.addLayer(layer);
                },
                pointToLayer: mem.pointToLayer
            });
            if (mem.order) {
                mem.group.setZIndex(mem.order);
            }
            mem.group.addTo(mainMap);
            mem.isLoaded = true
        }
    });
}

for (var l in mapLayersCache) {
    if (mapLayersCache.hasOwnProperty(l)) {
        var mem = mapLayersCache[l];
        if (!mem.isLoaded) {
            loadlayerGeojson(l);
        }
    }
}



mainMap.on("click", function (e) {
    hideObjectInfo();
});

$("[data-close-right-panel]").on("click", function (e) {
    hideRightPanel($("#" + $(this).data("close-right-panel")));
    e.preventDefault();
});

$('#raster_opacity').on("change mousewheel", geoRasterOpacity);
L.DomEvent.disableClickPropagation($('.map-opacity')[0]);


function onMouseOver(e) {
    clearOvelay();
    if (!e.target.options.isRasterShown) {
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
    var result = getPlanByNum(this.feature.properties.NumbCat);
    showObjectInfo(result, e.target);
    Vue.set(vueApp.$refs.plans, "activeItemNum", this.feature.properties.NumbCat);
}

function showObjectInfo(plan, target) {
    hideObjectInfo();
    showPopup(plan);
    if (showGeoRaster(plan.URL)) {
        target.options.isRasterShown = true
    };
    highlightIcon(target);
}

function hideObjectInfo() {
    clearOvelay();
    hideGeoRaster();
    hideRightPanel(popup);
    resetIcons();
    Vue.set(vueApp.$refs.plans, "activeItemNum", undefined);
}


function highlightIcon(feature) {
    var marker = feature._layers[Object.keys(feature._layers)[0]]; //BAD
    selected_markers.push(marker);
    marker.setIcon(selIcon);
}

function resetIcons() {
    $.each(selected_markers, function (index, item) {
        item.setIcon(defIcon);
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
    if (overlay) {
        mainMap.removeLayer(overlay);
    }
}

function showDrawingExtent(NumbCat, op_overlay_hash) {
    var res = getPlanByNum(NumbCat),
        op_overlay_hash = op_overlay_hash;

    if (res) {
        polygon_id = res.id;
        url = polygon_layer_url + polygon_id;

        $.ajax({

            url: url,
            dataType: 'JSON',
            success: function (data) {
                wkt_geom = data.geom;
                crs3857 = new L.Proj.CRS('EPSG:3857');

                var customLayer = L.geoJson(null, {
                    style: function (feature) {
                        return { color: '#f00' };
                    },
                    coordsToLatLng: function (coords) {
                        var point = L.point(coords[0], coords[1]);
                        return crs3857.projection.unproject(point);
                    }
                });

                overlay = omnivore.wkt.parse(wkt_geom, null, customLayer);
                if (overlay_hash === op_overlay_hash)
                    overlay.addTo(mainMap);
            }
        });
    }
}

function showPopup(plan) {
    if (plan) {
        var date = "",
            popupContent;

        if (plan.DateUpp && plan.DateLow) {
            date = plan.DateLow + " – " + plan.DateUpp;
        } else if (plan.DateLow) {
            date = "позже " + plan.DateLow;
        } else if (plan.DateUpp) {
            date = "до " + plan.DateUpp;
        }

        popupContent =
            "<div class='object-info__title h1'>" + plan.Title + "</div>" +
            "<div class='object-info__meta'>Шифр: " + plan.ArchNumb + "</div>" +
            "<div class='object-info__pic-wrapper'>" +
            "<div class='object-info__num'>" + plan.NumbCat + "</div>" +
            "<a class='object-info__pic-link' href='orig/" + plan.NumbCat + "/" + plan.NumbCat + ".jpg' target=_blank><img class='object-info__pic' src='preview/" + plan.NumbCat + "/p" + plan.NumbCat + ".jpg' width='150'></a>" +
            "</div>" +
            "<div class='h2'>Надписи</div> <p>" + plan.Text + "</p>" +
            "<div class='h2'>Надписи на обороте</div> <p>" + checkStr(plan.TextRev) + "</p>";

        if (date) popupContent += "<div class='h2'>Годы</div> <p>" + date + "</p>";

        popupInner.empty().html(popupContent);
        showRightPanel(popup);
    }
}

function zoomAndShowPopup(plan) {
    //search point
    var feat = null;
    centroids.eachLayer(function (layer) {
        if (layer.feature.properties.NumbCat == plan.NumbCat) {
            feat = layer;
            return;
        }
    });
    if (feat) {
        var center = feat.getBounds().getCenter();
        mainMap.setView(center, 15);

        var marker = feat._layers[Object.keys(feat._layers)[0]];
        markers.zoomToShowLayer(marker);
        showObjectInfo(plan, feat);
    }
}

function showGeoRaster(raster_url) {
    if (!raster_url || raster_url.length === 0 || /^\s*$/.test(raster_url))
        return;

    raster_layer = L.tileLayer(raster_url, {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">Rgada</a>'
    });
    raster_layer.addTo(mainMap);
    raster_layers.push(raster_layer);
    showOpacityControl();

    return true;
}


function hideGeoRaster() {
    $.each(raster_layers, function (index, item) {
        mainMap.removeLayer(item);
    });

    $.each(centroids._layers, function (index, item) {
        item.options.isRasterShown = false;
    });

    raster_layers = [];
    hideOpacityControl();
}

function geoRasterOpacity() {
    var new_opacity = $(this).val();
    var op = new_opacity / 100;

    $.each(raster_layers, function (index, item) {
        item.setOpacity(op);
    });
}

// show/hide raster opacity control

function showOpacityControl() {
    $(".map-opacity").fadeIn();
    $("#raster_opacity").val(100);

}

function hideOpacityControl() {
    $(".map-opacity").fadeOut();
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
    createCorner('upperbottom', 'right');
}

// Right panel

function showRightPanel(el) {
    if (!el.hasClass("active")) {
        $(".right-panel--dyn.active").each(function () {
            hideRightPanel($(this));
        });
        $("body").addClass("body--withRightPanel");
        el.addClass("active");
        setTimeout(function () { mainMap.invalidateSize(); }, 400);
    }
}

function hideRightPanel(el) {
    if (el.hasClass("active")) {
        el.removeClass("active");

        if (!$(".menu-control").hasClass("active")) {
            $("body").removeClass("body--withRightPanel");
            setTimeout(function () { mainMap.invalidateSize(); }, 400);
        }
    }
}