
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
          var data = $scope.data;
            data = $scope.data.map((row) => {
              var formattedRow = row;
              if (typeof row.value === 'string') {
                try {
                  formattedRow = Object.assign({}, row, {
                    value: (typeof row.value === 'string') ? JSON.parse(row.value) : row.value,
                  });
                } catch (e) {
                  console.warn('Value is not JSON compatible', e);
                }
              }
              return formattedRow;
            });
          
          $scope.rows = data; // because data is async/ly coming from an http call, we need to watch it, directive gets compiled from the beginning.
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
