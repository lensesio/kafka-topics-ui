
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
dataFlatTableModule.controller('dataFlatTableCtrl', function ($scope, $log, $routeParams, $filter, FlatTableFactory, env, hotRegisterer) {

 $scope.maxHeight = window.innerHeight - 310;
    if ($scope.maxHeight < 310) {$scope.maxHeight = 310}


   $scope.$watch("data", function() {
        if($scope.data) {
            flattenTable($scope.data); // because data is async/ly coming from an http call, we need to watch it, directive gets compiled from the beginning.
        }
   })


   $scope.$watch("search", function(newValue) {
    if($scope.data){
    $scope.refreshData()
    }
   })


  var t =0;

  $scope.$parent.$parent.$parent.$parent.$watch("showList",function() {
    if (t !=0 ) {
      setTimeout(function () {
        $scope.$apply(function () {
         createHotTable();
        });
      })
    }
  t++
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
             angular.forEach(rows, function ( row, key) {
             row= {
               'offset' : row.offset,
               'partition': row.partition,
               'key' : row.key,
               'value' : row.value
             }
                   if (row.key == undefined || row.key == null) row.key = '';
                   if (row.value == undefined || row.value == null) row.value = '';

                   if((angular.isNumber(row.value) || angular.isString(row.value)) && (angular.isNumber(row.key) || angular.isString(row.key))) {
                         extraColumnsNumberValue = 0
                         extraColumnsNumberKey = 0
                         var newRow = {
                             "offset" : row.offset,
                             "partition" : row.partition,
                             "key" : row.key,
                             "value" : row.value
                         }
                         $scope.cols = Object.keys(FlatTableFactory.flattenObject(newRow));
                         $scope.cols2 = [];
                         $scope.cols3 = [];
                   } else {
                         var flatValue = FlatTableFactory.flattenObject(row.value);
                         var flatKey = FlatTableFactory.flattenObject(row.key);
                         var rowExtraColumnsValues = (!(angular.isNumber(row.value) || angular.isString(row.value))) ? Object.keys(flatValue).length : 0;
                         var rowExtraColumnsKeys = (!(angular.isNumber(row.key) || angular.isString(row.key))) ? Object.keys(flatKey).length : 0;

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

                         $scope.cols =  Object.keys(FlatTableFactory.flattenObject(newRow));
                         if (!(angular.isNumber(row.value) || angular.isString(row.value))){
                           $scope.cols2 = Object.keys(FlatTableFactory.flattenObject(newRow.value));
                         }
                         else {
                           $scope.cols2 = []
                         }
                         if (!(angular.isNumber(row.key) || angular.isString(row.key))){
                           $scope.cols3 = Object.keys(FlatTableFactory.flattenObject(newRow.key));
                         }
                         else {
                           $scope.cols3 = [];
                         }

                   }
                   $scope.flatRows.push(FlatTableFactory.flattenObject(row));

                   if (key == rows.length -1) {
                       setTimeout(function () {
                               $scope.$apply(function () {
                                  createHotTable()
                               });
                     }, 500)
                   }
                 });

                 $scope.extraColsNumValues = extraColumnsNumberValue;
                 $scope.extraColsNumKeys = extraColumnsNumberKey;


          var itemsPerPage = (window.innerHeight - 300) / 31
          Math.floor(itemsPerPage) < 10 ? $scope.fittingItems =10 : $scope.fittingItems = Math.floor(itemsPerPage);

        $scope.paginationItems = $scope.fittingItems;
        $scope.showHideAllButtonLabel = 'show ' + rows.length;

      }
 }

  var hotRows;
  function createHotTable(){
     hotRows = [];
     $scope.hotTableHeaders = [];

      $scope.hotTableHeaders.push('Offset', 'Partition')

      if ($scope.extraColsNumKeys > 0){
        angular.forEach($scope.cols3, function(colheader) {
          $scope.hotTableHeaders.push('key.'+colheader)
        })
      } else {
        $scope.hotTableHeaders.push('Key')
      }

      if ($scope.extraColsNumValues > 0){
        angular.forEach($scope.cols2, function(colheader) {
          $scope.hotTableHeaders.push('value.'+colheader)
        })
      } else {
          $scope.hotTableHeaders.push('Value')
      }

      angular.forEach($scope.flatRows, function (rows) {
        var hotCol = [];
        angular.forEach(rows, function (col, key) {
          if( key !== "$$hashKey" ) {
           hotCol.push(col)
          }
        })

        hotRows.push(hotCol)
      })
      $scope.refreshData();
    }

   $scope.refreshData = function() {
    $scope.hotRows = $filter('filter')(hotRows, $scope.search);
     var hotsinstance = hotRegisterer.getInstance('my-handsontable');

     hotsinstance.addHook('afterRender', function () {
     $scope.hotsWidth = 25;
       angular.forEach($scope.hotTableHeaders, function (value, key) {
        $scope.hotsWidth = $scope.hotsWidth + hotsinstance.getColWidth(key);
       })
     });
   };


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
