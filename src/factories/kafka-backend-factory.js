
angular.
    module("backendUtils", []).
    factory('KafkaBackendFactory', function ($rootScope, $http, $log, $q,   env) {

    return {
        getListInfo: function () {
           var url = env.KAFKA_BACKEND() + '/topics/summaries';
           return req('GET', url);
        },
        getTopicSummary: function (topicName) {
           var url = env.KAFKA_BACKEND()  + '/topics/summary/' + topicName;
           return req('GET', url);
        }
    }


   /* Private Methods */

   function req(method, url, data) {
       var deferred = $q.defer();
       var request = {
             method: method,
             url: url,
             data: data,
             dataType: 'json',
             headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
           };

       $http(request)
         .success(function (response) {
            deferred.resolve(response);
          })
         .error(function (responseError) {
              var msg = "Failed at method [" + method + "] [" + url + "] with error: \n" + JSON.stringify(responseError);
              $log.error(msg);
              if (responseError.error_code == 404) {
                $rootScope.notExists = true;
              }
              deferred.reject(msg);
          });

       return deferred.promise;
   }

});