document.addEventListener('DOMContentLoaded',initMap); 
var map;
function moveHandler(){
	var coord = map.getBounds();
	var lt = coord.getNorthWest();
	var rb = coord.getSouthEast();
	
	var bbox = [rb.lat,lt.lng,lt.lat,rb.lng];
	requestData(bbox);
}
function requestData(bbox){
	var bicicletar = '(relation["amenity"="bicycle_rental"](' + bbox + ');' +
					 'way["amenity"="bicycle_rental"](' + bbox + ');' +
					 'node["amenity"="bicycle_rental"]('+ bbox + '));';
	/*
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
	*/
	var queryText = bicicletar;
	var query = '[out:json][timeout:60];' + queryText + 'out;';
	
	var queryURL = encodeURIComponent(query)
	var request = "http://overpass-api.de/api/interpreter?data="+queryURL;
	//console.log(request);
	
	$.ajax({
		url: request, 
		success:function(data){loadMarkers(data);},
		error:function(){requestData(bbox);}		
	});
};
function loadMarkers(data){
	var markerArray = new Array();
	for( var m in data.elements){
		L.marker([data.elements[m].lat, data.elements[m].lon]).addTo(map).bindPopup(data.elements[m].tags.network+'-'+data.elements[m].tags.name);
	};
}
function initMap(){
	map = new L.map('map');
	var osm = "http://{s}.tile.osm.org/{z}/{x}/{y}.png";
	var base = new L.TileLayer(osm,{maxZoom: 18,attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
	var crd = new L.LatLng(-3.73,-38.52);
	map.setView(crd,14).addLayer(base);
	map.on('moveend',function(){moveHandler();});
	moveHandler();
}
