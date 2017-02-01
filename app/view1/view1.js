'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope, Map, $mdDialog) {
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
		console.log(response);
		for (var i = 0; i < response.length; i++){
			if (response[i].id != 424 && response[i].id != 432 && response[i].id != 440){
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
		}

		// for (var i = 0; i < competitionIds.length; i++){
		// 	getTeams(competitionIds[i])
		// }
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
		// console.log(query);
		var countryCoordinates = [{
	    	name: "spain",
	    	lat: 40.4637,
	    	long: -3.7492 + 6
	    },{
	    	name: "england",
	    	lat: 52.3555,
	    	long: -1.1743 + 6
	    },{
	    	name: "germany",
	    	lat: 51.1657,
	    	long: 10.4515 + 6
	    },{
	    	name: "netherlands",
	    	lat: 52.1326,
	    	long: 5.2913 + 6
	    },{
	    	name: "france",
	    	lat: 46.2276,
	    	long: 2.2137 + 6
	    },{
	    	name: "italy",
	    	lat: 41.8719,
	    	long: 12.5674 + 6
	    },{
	    	name: "portugal",
	    	lat: 39.3999,
	    	long: -8.2245 + 6
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

	$scope.openTeamInfo = function(team){
		$mdDialog.show({
			locals: {team: team},
			controller: mdDialogTeamController,
			templateUrl: 'view1/team-dialog.html',
			clickOutsideToClose: true,
			fullscreen: false
		});
	}

	var mdDialogTeamController = function($scope, team){
		$scope.team = team;
		$scope.images = [];
		$scope.uploadListener = false;
		console.log($scope.team);
		var apiCall = team._links.team.href.replace("http", "https");

		$.ajax({
			  headers: { 'X-Auth-Token': '15379b45f5f84cd3af6e7765d09ebfa2' },
			  url: apiCall,
			  dataType: 'json',
			  type: 'GET',
			}).done(function(response) {
				console.log(response);
				$scope.teamInfo = response;
		});

		firebase.database().ref($scope.team.teamName).on('value', function(snapshot){
			$scope.images.length = 0;
			snapshot.forEach(function(childSnapshot){
				$scope.images.push(childSnapshot.val().imageUrl);
				$scope.$applyAsync();
			});
			// console.log($scope.images);
		});

		$scope.uploadPhoto = function(){
			// console.log("Uploading Photo");
			var uploadButton = document.getElementById('file');
			uploadButton.click();
			if (!$scope.uploadListener){
				$scope.uploadListener = true;
				uploadButton.addEventListener('change', function(e){
					var file = e.target.files[0];

					firebase.storage().ref().child($scope.team.teamName + '/' + guid()).put(file).then(function(snapshot){
						console.log("uploaded file");
						// console.log(snapshot);
						firebase.database().ref($scope.team.teamName).push({
							imageUrl: snapshot.a.downloadURLs[0]
						});
					});
				});
			}
		}

		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		function guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
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