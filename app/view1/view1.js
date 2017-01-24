'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope, Map) {
    $scope.selectedItem  = null;
    $scope.searchText    = null;
    $scope.querySearch   = querySearch;
    $scope.local = window.location.href.includes("localhost");
    $scope.data = [];
    var competitionIds = [];

    //Get all competitions
    $.ajax({
	  headers: { 'X-Auth-Token': '15379b45f5f84cd3af6e7765d09ebfa2' },
	  url: 'https://api.football-data.org/v1/competitions/',
	  dataType: 'json',
	  type: 'GET',
	}).done(function(response) {
		for (var i = 0; i < response.length; i++){
			$scope.data.push({
				type: 'competition',
				value: response[i].caption.toLowerCase(),
				display: response[i].caption,
				short_form: response[i].league
			});
			competitionIds.push({
				id: response[i].id,
				name: response[i].caption
			});
		}
		console.log($scope.data);
		for (var i = 0; i < competitionIds.length; i++){
			/*$.ajax({
				  headers: { 'X-Auth-Token': '15379b45f5f84cd3af6e7765d09ebfa2' },
				  url: 'https://api.football-data.org/v1/competitions/' + competitionIds[i].id + '/teams',
				  dataType: 'json',
				  type: 'GET',
				}).done(function(response) {
					for (var j = 0; j < response.teams.length; j++){
						$scope.data.push({
							type: 'team',
							value: response.teams[j].name.toLowerCase(),
							display: response.teams[j].name,
							crestUrl: response.teams[j].crestUrl
						});
					}
			});*/
		}
	});

    Map.init();

	$scope.getInfo = function (query){
		console.log(query);
		var countryCoordinates = [{
	    	name: "spain",
	    	lat: 40.4637,
	    	long: -3.7492
	    },{
	    	name: "england",
	    	lat: 52.3555,
	    	long: -1.1743
	    },{
	    	name: "germany",
	    	lat: 51.1657,
	    	long: 10.4515
	    },{
	    	name: "netherlands",
	    	lat: 52.1326,
	    	long: 5.2913
	    },{
	    	name: "france",
	    	lat: 46.2276,
	    	long: 2.2137
	    },{
	    	name: "italy",
	    	lat: 41.8719,
	    	long: 12.5674
	    },{
	    	name: "portugal",
	    	lat: 39.3999,
	    	long: -8.2245
	    }];

		if (query.short_form == "EC" || query.short_form == "CL"){
			//EUROPE
			Map.reset();
		} else if (query.short_form == "PL" || query.short_form == "ELC" || query.short_form == "EL1"){
			//ENGLAND
			Map.zoomToCountry(countryCoordinates[1]);
		} else if (query.short_form == "BL1" || query.short_form == "BL2" || query.short_form == "DFB"){
			//GERMANY
			Map.zoomToCountry(countryCoordinates[2]);
		} else if (query.short_form == "DED"){
			//NETHERLANDS
			Map.zoomToCountry(countryCoordinates[3]);
		} else if (query.short_form == "FL1" || query.short_form == "FL2"){
			//FRANCE
			Map.zoomToCountry(countryCoordinates[4]);
		} else if (query.short_form == "PD" || query.short_form == "SD"){
			//SPAIN
			Map.zoomToCountry(countryCoordinates[0]);
		} else if (query.short_form == "SA"){
			//ITALY
			Map.zoomToCountry(countryCoordinates[5]);
		} else if (query.short_form == "PPL"){
			//PORTUGAL
			Map.zoomToCountry(countryCoordinates[6]);
		}
		
	}

	$scope.reset = function (){
		Map.reset();
	}

	function querySearch (query) {
      var results = query ? $scope.data.filter( createFilterFor(query) ) : $scope.data;
      return results;
    }

    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) >= 0);
      };

    }

});