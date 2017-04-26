angular.
    module("env", ['HttpFactory']).
    factory('env', function ($http) {

          var allClusters = (typeof clusters !== "undefined") ? angular.copy(clusters) : [];
          var selectedCluster = null;
          var missingEnvJS = false;
          var connectivityError = false;

          setCluster();

          return {
            setSelectedCluster : function(clusterName) { setCluster(clusterName) },
            getSelectedCluster : function() { return selectedCluster; },
            getAllClusters : function() { return allClusters },
            isMissingEnvJS : function() { return missingEnvJS},
            KAFKA_REST : function () { return selectedCluster.KAFKA_REST.trim(); },
            RECORD_POLL_TIMEOUT: function () { return selectedCluster.RECORD_POLL_TIMEOUT.trim(); },
            MAX_BYTES : function () { return selectedCluster.MAX_BYTES.trim(); },
            DEBUG_LOGS_ENABLED : function () { return selectedCluster.DEBUG_LOGS_ENABLED.trim(); }
          };

          function setCluster(clusterName) {
            if(allClusters.length === 0) {
                setMissingEnvJS(true);
                console.log("File [env.js] does not exist")
             }
             if(angular.isUndefined(clusterName)) {
                  selectedCluster = allClusters[0];
             } else {
                  var filteredArray = allClusters.filter(function(el) {return el.NAME == clusterName});
                  selectedCluster = filteredArray.length == 1 ?  filteredArray[0]  : allClusters[0];
             }
          }

          function setMissingEnvJS(isMissing) {
            missingEnvJS = isMissing;
          }

          //TODO
//          function tryConnectivity(cluster) {
//            if(!missingEnvJS) {
//                console.log("RRR3", cluster.KAFKA_REST)
//                $http.get(cluster.KAFKA_REST).then(function(response) {
//                    console.log("RRR4", cluster.KAFKA_REST, response)
//                })
//            }
//          }

    });