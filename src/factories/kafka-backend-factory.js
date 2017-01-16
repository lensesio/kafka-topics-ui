/**
 * Kafka-Rest-Proxy angularJS Factory
 * version 0.7-SNAPSHOT (18.Aug.2016)
 *
 * @author antonios@landoop.com
 */
angularAPP.factory('KafkaBackendFactory', function ($rootScope, $http, $log, $q,   env) {

function getListInfo() {
    var url = env.KAFKA_BACKEND() + '/topics/summaries';
    var deferred = $q.defer();
   $http.get(url).then(
        function success(response) {
          var topicInfo = response.data;
          deferred.resolve(topicInfo);
        },
        function failure(response) {
          $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
          deferred.reject("Error in getting topics from kafka-rest");
        });

return deferred.promise;
}

function getTopicSummary(topicName) {
    var url = env.KAFKA_BACKEND() + '/topics/summary/' + topicName;
    var deferred = $q.defer();
   $http.get(url).then(
        function success(response) {
          var topicInfo = response.data;
          deferred.resolve(topicInfo);
        },
        function failure(response) {
          $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
          deferred.reject("Error in getting topics from kafka-rest");
        });
console.log('giannis', deferred.promise)
return deferred.promise;
}

return {
getListInfo: function () {
      return getListInfo();
    },
getTopicSummary: function (topicName) {
      return getTopicSummary(topicName);
    }
}

});