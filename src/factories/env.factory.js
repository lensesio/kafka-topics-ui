angularAPP.factory('env', function ($rootScope) {

  var clusterArray = (typeof clusters !== "undefined") ? angular.copy(clusters) : [];
  var selectedCluster = null;
  setCluster();

  return {
    setSelectedCluster : function(clusterName) { setCluster(clusterName) },
    getSelectedCluster : function() { return selectedCluster; },
    getClusters : function() { return clusters },
    KAFKA_REST : function () { return selectedCluster.KAFKA_REST.trim(); },
    MAX_BYTES : function () { return selectedCluster.MAX_BYTES.trim(); }
  };

  function setCluster(clusterName) {
    if(clusterArray.length == 0) {
        $rootScope.missingEnvJS = true;
              console.log("File [env.js] does not exist")
     }
     if(angular.isUndefined(clusterName)) {
          selectedCluster = clusterArray[0];
     } else {
          var filteredArray = clusterArray.filter(function(el) {return el.NAME == clusterName});
          selectedCluster = filteredArray.length == 1 ?  filteredArray[0]  : clusterArray[0]
     }
  }

});