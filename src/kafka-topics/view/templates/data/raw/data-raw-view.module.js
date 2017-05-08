
var dataRawViewModule = angular.module('rawView', []);

dataRawViewModule.directive('rawView', function() {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      topicType: '='
    },
    templateUrl: 'src/kafka-topics/view/templates/data/raw/data-raw-view.html',
    controller: 'dataRawViewCtrl'
//    link: function(scope, element, attrs){ //... }
  };
});


dataRawViewModule.controller('dataRawViewCtrl', function ($scope, $log) {

   $scope.$watch("data", function() {
        if($scope.data) {
            ($scope.topicType == 'json') ? $scope.aceString = $scope.data :$scope.aceString = angular.toJson($scope.data, true);
        }
   })

   $scope.aceLoaded = function (_editor) {
        $scope.editor = _editor;
        $scope.editor.$blockScrolling = Infinity;
        _editor.setOptions({
          minLines: 33
          });
   };

  $scope.aceHeight = window.innerHeight - 290;
  $scope.aceHeight < 400 ? $scope.aceHeight = 400 : ''



});
