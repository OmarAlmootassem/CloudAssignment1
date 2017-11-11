/*!
 * Team Experience
 * Omar Almootassem
 * v1.1
 */

'use strict';

angular.module('myApp.map', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/map', {
    templateUrl: 'map/map.html',
    controller: 'MapCtrl'
  });
}])

/**
 * View1Ctrl
 * @param {!angular.$scope} $scope
 * @param {!myApp.Map} Map
 * @param {!angular-material.$mdDialog} $mdDialog
 */
.controller('MapCtrl', function($scope, Map, $mdDialog, $http) {
    $scope.selectedItem  = null;	//Item chosen from search bar
    $scope.searchText    = null;	//Text in the search bar
    $scope.querySearch   = querySearch;
    $scope.local = window.location.href.includes("localhost");	//Check if app is running on localhost
    $scope.data = [];	//JSON array of leagues
    var competitionIds = [];	//JSON array of competitions

    /*
     * Retreives JSON array of all competitions available in the api
     * using ajax to handle background process
     */
    $http.get('http://localhost:3001/api/cloud/1/competitions').then(function(data) {
    	var response = data.data;
    	//Loop through the entire response
		for (var i = 0; i < response.length; i++){
			//Only add a competition if it is a league competition and not a knockout competition
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
    }, function(err) {
    	console.error(err);
    });

	/**
	 * Retreives list of teams in specified league
	 * @param league
	 */
	function getTeams (league){
		$http.get('http://localhost:3001/api/cloud/1/competitions/' + league.id + '/teams').then(function(data) {
			var response = data.data;
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
		}, function(err) {
			console.error(err);
		});
	}

    Map.init();	//Initialize the Google Map

    /**
     * Gets information from the query and uses it to zoom in the map
     * and display the correct information
     * @param query - JSON object chosen from search
     */
	$scope.getInfo = function (query){
		//Coordinates for the countries with the longitude offset by 6 to 
		//offset the map to the left
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

		showCompetitionInfo(query);
	}

	/**
	 * Opens a dialog displaying more detailed information about the team
	 * @param team - the team
	 */
	$scope.openTeamInfo = function(team){
		$mdDialog.show({
			locals: {team: team},
			controller: mdDialogTeamController,
			templateUrl: 'map/team-dialog.html',
			clickOutsideToClose: true,
			fullscreen: false
		});
	}

	/**
	 * Controller for the teams mdDialog
	 * @param {!angular.$scope} $scope
	 * @param {!myApp.team} team
	 */
	var mdDialogTeamController = function($scope, team){
		$scope.team = team;
		$scope.images = [];	//List of all images
		$scope.uploadListener = false;
		// console.log($scope.team);
		var apiCall = team._links.team.href.replace("http", "https");	//ensure that api call is secured

		//Get team information
		$http.post('http://localhost:3001/api/cloud/1/team', {api: apiCall}).then(function(data) {
			var response = data.data;
				$scope.teamInfo = response;
		}, function(err) {
			console.error(err);
		});

		//Get a list of all the images already uploaded
		firebase.database().ref($scope.team.teamName).on('value', function(snapshot){
			$scope.images.length = 0;
			snapshot.forEach(function(childSnapshot){
				$scope.images.push(childSnapshot.val().imageUrl);
				$scope.$applyAsync();
			});
		});

		/**
		 * Uploads the photos
		 */
		$scope.uploadPhoto = function(){
			// console.log("Uploading Photo");
			var uploadButton = document.getElementById('file');
			uploadButton.click();
			if (!$scope.uploadListener){
				$scope.uploadListener = true;
				//Add an event listener for the upload button
				uploadButton.addEventListener('change', function(e){
					var file = e.target.files[0];

					//Upload the file to firebase and save a reference in the database
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

		/**
		 * Closes the dialog
		 */
		$scope.cancel = function(){
			$mdDialog.cancel();
		}

		/**
		 * Generates a Unique ID
		 */
		function guid() {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		}
	}

	/**
	 * Retrieves the league table for the specified competition
	 * @param competitions - the specified competition
	 */
	var showCompetitionInfo = function(competition){
		$http.get('http://localhost:3001/api/cloud/1/competitions/' + competition.id + '/table').then(function(data) {
			var response = data.data;
			$scope.table = [];
				$scope.leagueName = response.leagueCaption;	//Save the league name is a scope variabl
				//Save the league table in an array
				for (var i = 0; i < response.standing.length; i++){
					$scope.table.push(response.standing[i]);
				}
				// console.log($scope.table);
				$scope.$applyAsync();
		}, function(err) {
			console.error(err);
		});
	}

	/**
	 * Resets the map and clears the table
	 */
	$scope.reset = function (){
		Map.reset();
		$scope.table = [];
	}

	/**
	 * Part of the autocomplete to search for possible completions
	 * @param query - the text in the autocomplete box
	 * @return results - list of suggestions
	 */
	function querySearch (query) {
      var results = query ? $scope.data.filter( createFilterFor(query) ) : $scope.data;
      return results;
    }

    /**
     * Creates a filter for the query
     * @param query - the text in the autocomplete box
     * @return filterFn(state) - suggestion
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) >= 0);
      };

    }

});