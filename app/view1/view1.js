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
				id: response[i].id,
				league_short: response[i].league
			});
			competitionIds.push({
				id: response[i].id,
				name: response[i].caption,
				short_form: response[i].league
			});
		}
		console.log(competitionIds);
		for (var i = 0; i < competitionIds.length; i++){
			getTeams(competitionIds[i])
		}
	});

	var getTeams = function (league){
		$.ajax({
			  headers: { 'X-Auth-Token': '15379b45f5f84cd3af6e7765d09ebfa2' },
			  url: 'https://api.football-data.org/v1/competitions/' + league.id + '/teams',
			  dataType: 'json',
			  type: 'GET',
			}).done(function(response) {
				for (var j = 0; j < response.teams.length; j++){
					$scope.data.push({
						type: 'team',
						value: response.teams[j].name.toLowerCase(),
						display: response.teams[j].name,
						crestUrl: response.teams[j].crestUrl,
						league_short: league.short_form,
						league: league.name
					});
				}
		});
	}

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

		if (query.league_short == "EC" || query.league_short == "CL"){
			//EUROPE
			Map.reset();
		} else if (query.league_short == "PL" || query.league_short == "ELC" || query.league_short == "EL1"){
			//ENGLAND
			Map.zoomToCountry(countryCoordinates[1]);
		} else if (query.league_short == "BL1" || query.league_short == "BL2" || query.league_short == "DFB"){
			//GERMANY
			Map.zoomToCountry(countryCoordinates[2]);
		} else if (query.league_short == "DED"){
			//NETHERLANDS
			Map.zoomToCountry(countryCoordinates[3]);
		} else if (query.league_short == "FL1" || query.league_short == "FL2"){
			//FRANCE
			Map.zoomToCountry(countryCoordinates[4]);
		} else if (query.league_short == "PD" || query.league_short == "SD"){
			//SPAIN
			Map.zoomToCountry(countryCoordinates[0]);
		} else if (query.league_short == "SA"){
			//ITALY
			Map.zoomToCountry(countryCoordinates[5]);
		} else if (query.league_short == "PPL"){
			//PORTUGAL
			Map.zoomToCountry(countryCoordinates[6]);
		}

		if (query.type == "competition"){
			showCompetitionInfo(query);
		} else if (query.type == "team"){

		}
		
	}

	var showCompetitionInfo = function(competition){
		$.ajax({
			  headers: { 'X-Auth-Token': '15379b45f5f84cd3af6e7765d09ebfa2' },
			  url: 'https://api.football-data.org/v1/competitions/' + competition.id + '/leagueTable',
			  dataType: 'json',
			  type: 'GET',
			}).done(function(response) {
				$scope.table = [];
				$scope.leagueName = response.leagueCaption;
				for (var i = 0; i < response.standing.length; i++){
					$scope.table.push(response.standing[i]);
				}
				console.log($scope.table);
				$scope.$applyAsync();
		});
	}

	$scope.reset = function (){
		Map.reset();
		$scope.table = [];
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