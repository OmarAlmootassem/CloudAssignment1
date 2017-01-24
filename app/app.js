'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', [
  'ngRoute', 'ngMaterial',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]);

app.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

app.service('Map', function($q) {
    
    this.init = function() {
        var options = {
            center: new google.maps.LatLng(48.5260, 15.2551),
            zoom: 5,
            disableDefaultUI: true    
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
    }
    
    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str}, function(results, status) {
            if (status == 'OK') {
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }
    
    this.addMarker = function(res) {
        if(this.marker) this.marker.setMap(null);
        this.marker = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP
        });
        this.map.setCenter(res.geometry.location);
    }

    this.zoomToCountry = function(info) {
    	this.map.setCenter(new google.maps.LatLng(info.lat, info.long));
    	this.map.setZoom(6);
    }

    this.reset = function(){
    	this.map.setCenter(new google.maps.LatLng(48.5260, 15.2551));
    	this.map.setZoom(5);
    }
    
});
