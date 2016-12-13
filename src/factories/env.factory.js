angularAPP.factory('env', function ($rootScope) {


  var clusterArray = (typeof clusters !== "undefined") ? angular.copy(clusters) : [];
  var selectedCluster = null;
  setCluster();

  return {
    setSelectedCluster : function(clusterName) { setCluster(clusterName)},
    getSelectedCluster : function() { return selectedCluster; },
    getClusters : function() { return clusters} ,
    KAFKA_REST : function () { return selectedCluster.KAFKA_REST; },
    MAX_BYTES : function () { return selectedCluster.MAX_BYTES; }
  }

  function setCluster(clusterName) {
    if(clusterArray.length == 0) {
        $rootScope.missingEnvJS = true;
              console.log("NOT EXISTS env.js")
     }
     if(angular.isUndefined(clusterName)) {
          selectedCluster = clusterArray[0];
     } else {
          var filteredArray = clusterArray.filter(function(el) {return el.NAME == clusterName})
          selectedCluster = filteredArray.length == 1 ?  filteredArray[0]  : clusterArray[0]
     }
  }


});