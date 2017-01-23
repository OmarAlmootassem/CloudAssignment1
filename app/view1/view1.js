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
    Map.init();
	$scope.data = [{
		value: "omar",
		display: "Omar"
	},{
		value: "amer",
		display: "Amer"
	},{
		value: "omarr",
		display: "Omarr"
	},{
		value: "amal",
		display: "Amal"
	},{
		value: "ameer",
		display: "Ameer"
	}];

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
        return (state.value.indexOf(lowercaseQuery) === 0);
      };

    }

});