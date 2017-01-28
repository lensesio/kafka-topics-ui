
angular.
    module("HttpFactory", []).
    factory('HttpFactory', function ( $http, $log, $q, env) {

    var endpoint = env.KAFKA_BACKEND();

    return {
        //todo move this function to view
        getTopicSummary: function (topicName) {
           return req2('GET', endpoint  + '/topics/summary/' + topicName);
        },
        req: function(method, url, data) {
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
                    deferred.reject(msg);
                });

             return deferred.promise;
        }
    }


   /* Private Methods */

   function req2(method, url, data) {
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