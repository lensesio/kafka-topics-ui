
var dataTreeViewModule = angular.module('treeView', []);

dataTreeViewModule.directive('treeView', function() {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      partitions: '=', //Pass pagination?
      topic: '=', //Pass pagination?
      search: '='
    },
    templateUrl: 'src/kafka-topics/view/templates/data/tree/data-tree-view.html',
    controller: 'dataTreeViewCtrl'
  };
});


dataTreeViewModule.controller('dataTreeViewCtrl', function ($scope, $log) {

   $scope.$watch("data", function() {
        if($scope.data) {
            $scope.rows = $scope.data; // because data is async/ly coming from an http call, we need to watch it, directive gets compiled from the beginning.
        }
   })

   $scope.paginationItems = 20;

   $scope.isAvroOrJsonValue = function (keyOrValue) {
      return keyOrValue=='json' || keyOrValue=='avro';
   }


});
