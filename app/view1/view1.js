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
	  url: 'http://api.football-data.org/v1/competitions/',
	  dataType: 'json',
	  type: 'GET',
	}).done(function(response) {
		console.log(response);
		for (var i = 0; i < response.length; i++){
			$scope.data.push({
				value: response[i].caption.toLowerCase(),
				display: response[i].caption
			});
			competitionIds.push({
				id: response[i].id,
				display: response[i].caption
			});
		}
	});

    Map.init();

	$scope.getInfo = function (query){
		console.log("Getting info: " + query);
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