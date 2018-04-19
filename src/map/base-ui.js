'use strict';

const log = require('../log');
const svgMarker = require('../svg-marker');
const leaflet = require('leaflet');
const leafletMini = require('leaflet-minimap');
const EventEmitter = require('events').EventEmitter;

const tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
//const osmAttrib='Map data &copy; OpenStreetMap contributors';
const attribution =
  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>';

// TODO: I'm not sure what the ideal zoom level is.  Leaflet often uses 13
// in docs and tutorials.  14 seems to provide a bit more context
// We need something that makes sense for the scale of bridges
// and a person/car/vehicle moving between them.
const defaultZoomLevel = 16;
let marker;
let map;

class BaseUI extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
  }

  init(lat, lng) {
    let mapEl = document.createElement('div');
    mapEl.id = 'map';
    document.body.appendChild(mapEl);
    // http://leafletjs.com/reference-1.3.0.html#map
     map = (this.map = leaflet.map(mapEl,this.options));
    leaflet.tileLayer(tileUrl, { attribution }).addTo(map);
    map.setView([lat, lng], defaultZoomLevel);

    // http://leafletjs.com/reference-1.3.0.html#map-event
    let onMapChange = () => this.emit('update', map.getBounds());
    map.on('viewreset', onMapChange);
    map.on('moveend', onMapChange);

    // Show a marker at our current location
    this.currentLocationMarker = leaflet
      .marker([lat, lng], {
        title: 'Current Location',
        icon: svgMarker.location
      })
      .addTo(map);
    
    log.info(`Map initialized with centre lat=${lat}, lng=${lng}`); 
  }

  get zoomLevel() {
    return defaultZoomLevel;
  }

  /**
   * Add a marker to the map
   * @param {*} lat
   * @param {*} lng
   * @param {*} title tooltip to show
   * @param {*} icon icon to use
   * @param {*} onClick optional onClick handler
   */
  addMarker(lat, lng, title, icon, cardUrl, streetViewUrl) {
     marker = leaflet
      .marker([lat, lng], {
        title,
        icon
      })
      .bindPopup(`<img src="${cardUrl}">`)
      .addTo(this.map);

    // Wire-up a click handlers for this marker
    marker.on('click', () => marker.openPopup());
    marker.on('dblclick', () => window.open(streetViewUrl));

    log.debug(`Added marker title=${title} at lat=${lat}, lng=${lng}`);
    return marker;
  }
  /**
   * Centre of the map and update location marker
   */
  setCurrentLocation(lat, lng) {
    this.currentLocationMarker.setLatLng({ lat, lng });
    this.map.setView([lat, lng], this.zoomLevel);
    log.debug(`Moved current location marker to lat=${lat}, lng=${lng}`);
  }

  getCurrentLocation() {
    return this.map.getCenter();
  }

  redraw() {
    this.map.invalidateSize();
  }
  setMinimap(){
    let myMarker = leaflet.marker([43.7735,79.5019]);
    let minimapLayer =  {
      osm : leaflet.tileLayer(tileUrl, { attribution })
    };
    //let getallmarkers
   // let minimap = new leafletMini(minimapLayer.osm,{ toggleDisplay: true , position:'topright' }).addTo(this.map); 
    //let myLocationMini =  new leaflet.CircleMarker(myLatLng,{radius : 2}); 
    let layers = new leaflet.LayerGroup([minimapLayer.osm, myMarker]);
    let minimap = new leaflet.Control.MiniMap(layers,{toggleDisplay: true , position:'topright'}).addTo(this.map);
  } 
}

module.exports = BaseUI;
