document.addEventListener('DOMContentLoaded',initMap); 
var map;
var layergroup;
function changeSelection(){
	layergroup.clearLayers();
	moveHandler();
}
function moveHandler(){
	var coord = map.getBounds();
	var lt = coord.getNorthWest();
	var rb = coord.getSouthEast();
	
	var bbox = [rb.lat,lt.lng,lt.lat,rb.lng];
	console.log('BBOX:'+bbox);
	requestData(bbox);
}
function requestcycloway(){
	var bbox = [];
	
	var ciclofaixas = 'node["cycleway:right"="lane"](' + bbox + ');' +
	  'way["cycleway:right"="lane"](' + bbox + ');'+
	  'relation["cycleway:right"="lane"](' + bbox + ');'+
	  'node["cycleway:left"="lane"](' + bbox + ');'+
	  'way["cycleway:left"="lane"](' + bbox + ');'+
	  'relation["cycleway:left"="lane"](' + bbox + ');'+
	  'node["cycleway:right"="track"](' + bbox + ');'+
	  'way["cycleway:right"="track"](' + bbox + ');'
	  'relation["cycleway:right"="track"](' + bbox + ');'+
	  'node["highway"="cycleway"](' + bbox + ');'+
	  'way["highway"="cycleway"](' + bbox + ');'+
	  'relation["highway"="cycleway"](' + bbox + ');';
	var query = '[out:json][timeout:60];(' + queryText + ');out;';
	var queryURL = encodeURIComponent(query)
	var request = "http://overpass-api.de/api/interpreter?data="+queryURL;
	console.log(request);
//	$.ajax({
//		url: request, 
//		success:function(data){parseData(data);},
//		error:function(){requestData(bbox);}		
//	});

	
}
function requestData(bbox){
	var aluguel_de_bicicletas = 'node["amenity"="bicycle_rental"]('+ bbox + ');';
	var bicicletario = 'node["amenity"="bicycle_parking"]('+ bbox + ');';
	var posto_de_gasolina = 'node["amenity"="fuel"]('+ bbox + ');';
	
	var queryText = "";
	
	if($('input[name=bicicletar]').is(':checked')){
		queryText = queryText + aluguel_de_bicicletas;
	}
	if($('input[name=bicicletario').is(':checked')){
		queryText = queryText + bicicletario;
	}
	if($('input[name=posto_de_gasolina').is(':checked')){
		queryText = queryText + posto_de_gasolina;
	}

	var query = '[out:json][timeout:60];(' + queryText + ');out;';
	var queryURL = encodeURIComponent(query)
	var request = "http://overpass-api.de/api/interpreter?data="+queryURL;
	console.log(request);
	$.ajax({
		url: request, 
		success:function(data){parseData(data);},
		error:function(){requestData(bbox);}		
	});
};
function parseData(data){
	
	var geojson = new Object();
	geojson.type = "FeatureCollection";
	geojson.generator = data.generator;
	geojson.copyright = data.osm3s.copyrigth;
	geojson.timestamp = data.osm3s.timestamp_osm_base;
	geojson.features = new Array();
	for (var index in data.elements){
			var obj = {
					"type": "feature",
					"id": data.elements[index].type+"/"+data.elements[index].id,
					"properties":{
						"@id": data.elements[index].type+"/"+data.elements[index].id,
						"amenity": data.elements[index].tags.amenity,
						"bicycle_parking": data.elements[index].tags.bicycle_parking,
						"capacity": data.elements[index].tags.capacity,
						"description": data.elements[index].tags.description,
						"name": data.elements[index].tags.name,
						"network": data.elements[index].tags.network,
						"operator": data.elements[index].tags.operator
					},
					"geometry":{
						"type": (data.elements[index].type == "node" ? "point" : data.elements[index].type == "way" ? "lineString" : null),
						"coordinates":[data.elements[index].lon,data.elements[index].lat]
						}
					}
		geojson.features.push(obj);
	};
	loadMarkers(geojson);
};

function loadMarkers(data){
	console.log(data);
	var markerArray = new Array();
	for( var m in data.features){
		markerArray.push(L.marker([data.features[m].geometry.coordinates[1], data.features[m].geometry.coordinates[0]]));
	};
	layergroup = L.layerGroup(markerArray);

	map.addLayer(layergroup);
}

function initMap(){
	map = new L.map('map');
	var osm = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
	var base = new L.TileLayer(osm,{maxZoom: 18,attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
	var crd = new L.LatLng(-3.73,-38.52);
	map.setView(crd,14).addLayer(base);
	map.on('moveend',function(){changeSelection();});
	moveHandler();
}
