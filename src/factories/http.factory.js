angular.
    module("HttpFactory", []).
    factory('HttpFactory', function ($http, $log, $q) {

    return {
        req: function(method, url, data, contentType) {
             var deferred = $q.defer();
             var request = {
                   method: method,
                   url: url,
                   data: data,
                   dataType: 'json',
                   headers: {
                            'Content-Type': contentType,
                            'Accept': contentType //'application/json'
                            }
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

});