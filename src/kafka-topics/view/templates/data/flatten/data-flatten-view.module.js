
var dataFlatTableModule = angular.module('flatView', []);

dataFlatTableModule.directive('flatView', function() {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      partitions: '=',
      search: '='
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
dataFlatTableModule.controller('dataFlatTableCtrl', function ($scope, $log, FlatTableFactory) {

   $scope.$watch("data", function() {
        if($scope.data) {
            flattenTable($scope.data); // because data is async/ly coming from an http call, we need to watch it, directive gets compiled from the beginning.
        }
   })

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
                    if (row.key == undefined || row.key == null) row.key = '';
                    if (row.value == undefined || row.value == null) row.value = '';

                    if(angular.isNumber(row.value) || angular.isString(row.value)) {
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
                          var rowExtraColumnsValues = Object.keys(flatValue).length;
                          var rowExtraColumnsKeys = Object.keys(flatKey).length;

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
                          $scope.valueFlatColumns = Object.keys(FlatTableFactory.flattenObject(newRow.value));
                          $scope.keyFlatColumns = Object.keys(FlatTableFactory.flattenObject(newRow.key));

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
