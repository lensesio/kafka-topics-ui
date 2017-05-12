
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


dataTreeViewModule.controller('dataTreeViewCtrl', function ($scope, $log, $base64) {

   $scope.$watch("data", function() {
        if($scope.data) {
            $scope.rows = $scope.data; // because data is async/ly coming from an http call, we need to watch it, directive gets compiled from the beginning.
            $scope.currentPage = 1
        }
   })



   $scope.paginationItems = Math.floor($scope.$parent.maxHeight / 65);
      $scope.$parent.$watch("format", function() {
           if($scope.$parent.format) {
               $scope.format = $scope.$parent.format

           }
      })
   $scope.decode = function(string){
   return $base64.decode(string)
   }

   $scope.isAvroOrJsonValue = function (keyOrValue) {
      return keyOrValue=='json' || keyOrValue=='avro';
   }


});
