/*!
 * Team Experience
 * Omar Almootassem
 * v1.1
 */

'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute', 'ngMaterial',
  'myApp.map',
  'myApp.version'
]);

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({redirectTo: '/map'});
}]);

/**
 * Google Maps Service
 */
app.service('Map', function($q) {
    
    /**
     * Initializes the Google Map
     */
    this.init = function() {
        //Sets the default configuration for the map
        var options = {
            center: new google.maps.LatLng(48.5260, 15.2551),
            zoom: 5,
            disableDefaultUI: true    
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
    }

    /**
     * Zooms the map to the coordinates specified in info
     * @param info - JSON object containing coordinates
     */
    this.zoomToCountry = function(info) {
    	this.map.setCenter(new google.maps.LatLng(info.lat, info.long));
    	this.map.setZoom(6);
    }

    /**
     * resets the map back to default settings
     */
    this.reset = function(){
    	this.map.setCenter(new google.maps.LatLng(48.5260, 15.2551));
    	this.map.setZoom(5);
    }
    
});
