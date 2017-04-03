
var dataFlatTableModule = angular.module('flatView', []);

dataFlatTableModule.directive('flatView', function() {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      partitions: '=',
      search: '=',
      topic: '='
    },
    templateUrl: 'src/kafka-topics/view/templates/data/flatten/data-flatten-view.html',
    controller: 'dataFlatTableCtrl',
   link: function(scope, element, attrs){
//         scope.$watch(function() {
//            console.log('test', scope.data)
//            scope.mrows = scope.data
//          });
    }
  };
});

topicsListModule.factory('FlatTableFactory', function (HttpFactory) {

    return {
        flattenObject: function (ob) {
           return flattenObject(ob);
        },
        sortByKey: function (array, key, reverse) {
            return sortByKey(array, key, reverse);
          },
        getTopicSummary: function (topicName, endpoint) {
           return HttpFactory.req('GET', endpoint  + '/topics/summary/' + topicName);
        }
    }

    function flattenObject(ob) {
        var toReturn = {};

        for (var i in ob) {
            if (!ob.hasOwnProperty(i)) continue;

            if ((typeof ob[i]) == 'object') {
                var flatObject = flattenObject(ob[i]);

                for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;
                    toReturn[i + '.' + x] = flatObject[x];
                }

            } else {
                toReturn[i] = ob[i];
            }
        }
        return toReturn;
    };

     // Sort arrays by key
     function sortByKey(array, key, reverse) {
          return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 * reverse : ((x > y) ? 1 * reverse : 0));
          });
     }
});

//TODO Clean me up! ALL shit happens here
dataFlatTableModule.controller('dataFlatTableCtrl', function ($scope, $log, $routeParams, FlatTableFactory, env) {

   $scope.$watch("data", function() {
        if($scope.data) {
            flattenTable($scope.data); // because data is async/ly coming from an http call, we need to watch it, directive gets compiled from the beginning.
        }
   })
  var doFlattenValue;
  var doFlattenKey;
  var doNotFlatten;

   $scope.$watch("topic", function() {
        if($scope.topic) {
            doFlattenValue = isAvroOrJsonValue($scope.topic.valueType)
            doFlattenKey =   isAvroOrJsonValue($scope.topic.keyType)
            doNotFlatten = !(doFlattenValue || doFlattenKey);
        }
   })

  function  isAvroOrJsonValue(keyOrValue) {
     return keyOrValue=='json' || keyOrValue=='avro';
  }

  $scope.isNotAvroOrJsonValue
  $scope.paginationItems = 20;

  $scope.allCols = [
     {id: "offset", label: "offset"},
     {id: "partition", label: "partition"},
     {id: "key", label: "key"},
     {id: "value", label: "value"}];

  $scope.selectedCols = {};

  $scope.checkAndHide = function checkAndHide(name) {
    if ($scope.selectedCols.searchText){
        var showCol = $scope.selectedCols.searchText.some(function (selectedCols) {
          return selectedCols === name;
        });
        return showCol
    }
  }

  $scope.addColumnClass = function (columnIndex) {
      columnIndex = columnIndex + 1;
      var columnClass = '';
      if (columnIndex == 1 ) {columnClass='offset'}
      else if(columnIndex == 2) {columnClass='partition'}
      else if(columnIndex < 4 + $scope.keyFlatColumns.length ) {columnClass='key'}
      else if(columnIndex < 5 + $scope.keyFlatColumns.length  + $scope.valueFlatColumns.length ) {columnClass='value'}
      return columnClass;
  }

  $scope.query = { order: 'offset', limit: 100, page: 1 };

  // This one is called each time - the user clicks on an md-table header (applies sorting)
  $scope.logOrder = function (a) {
      // $log.info("Ordering event " + a);
      sortTopic(a);
  };


  function flattenTable(rows) {

          var extraColumnsNumberValue = 0;
          var extraColumnsNumberKey = 0;
          var rowWithMoreColumns;

          $scope.flatRows = [];

          if (rows.length > 0) {
              angular.forEach(rows, function (row) {
                if ($scope.topic.keyType == 'binary'){row.key = '-binary data-'}
                if ($scope.topic.valueType == 'binary'){row.value = '-binary data-'}

                    if (row.key == undefined || row.key == null) row.key = '';
                    if (row.value == undefined || row.value == null) row.value = '';

                    if(doNotFlatten) {
                          extraColumnsNumberValue = 0
                          extraColumnsNumberKey = 0
                          var newRow = {
                              "offset" : row.offset,
                              "partition" : row.partition,
                              "key" : row.key,
                              "value" : 'value' +  row.value
                          }
                          $scope.flatColumns = Object.keys(FlatTableFactory.flattenObject(newRow));
                          $scope.keyFlatColumns = [];
                          $scope.valueFlatColumns = [];
                    } else {
                          var flatValue = FlatTableFactory.flattenObject(row.value);
                          var flatKey = FlatTableFactory.flattenObject(row.key);
                          var rowExtraColumnsValues = doFlattenValue ? Object.keys(flatValue).length : 1;
                          var rowExtraColumnsKeys = doFlattenKey ? Object.keys(flatKey).length : 1;

                          if(extraColumnsNumberValue < rowExtraColumnsValues) {
                              extraColumnsNumberValue = rowExtraColumnsValues;
                              rowWithMoreColumns = row;
                          }

                          if(extraColumnsNumberKey < rowExtraColumnsKeys) {
                              extraColumnsNumberKey = rowExtraColumnsKeys;
                              rowWithMoreColumns = row;
                          }

                          var newRow = {
                              "offset" : rowWithMoreColumns.offset,
                              "partition" : rowWithMoreColumns.partition,
                              "key" : rowWithMoreColumns.key,
                              "value" : rowWithMoreColumns.value
                          }

                          $scope.flatColumns =  Object.keys(FlatTableFactory.flattenObject(newRow));

                        if (doFlattenValue){
                          $scope.valueFlatColumns = Object.keys(FlatTableFactory.flattenObject(newRow.value));
                        }
                        else {
                           $scope.valueFlatColumns  = []
                        }
                        if (doFlattenKey){
                          $scope.keyFlatColumns = Object.keys(FlatTableFactory.flattenObject(newRow.key));
                        }
                        else {
                           $scope.keyFlatColumns  = []
                        }
                    }
                   $scope.flatRows.push(FlatTableFactory.flattenObject(row));

                  });

                  $scope.extraColsNumValues = extraColumnsNumberValue;
                  $scope.extraColsNumKeys = extraColumnsNumberKey;

       }
  }

  function sortTopic(type) {
      var reverse = 1;
      if (type.indexOf('-') == 0) {
        // remove the - symbol
        type = type.substring(1, type.length);
        reverse = -1;
      }
       $log.info(type + " " + reverse);
      $scope.flatRows = FlatTableFactory.sortByKey($scope.flatRows, type, reverse);
  }

});
