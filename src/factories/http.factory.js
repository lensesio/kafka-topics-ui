angular.
    module("HttpFactory", []).
    factory('HttpFactory', function ($http, $log, $q) {

    function printDebugCurl(method, url, data, contentType){
          var curlCreateConsumer = 'curl -X '+ method +' -H "Content-Type: ' + contentType + '" ' + "--data '" + JSON.stringify(data) + "' " + url;
          $log.debug("HttpFactory:  " + curlCreateConsumer);
      }

    return {
        req: function(method, url, data, contentType, acceptType, resolveError, withDebug) {
             var deferred = $q.defer();
             var request = {
                   method: method,
                   url: url,
                   data: data,
                   dataType: 'json',
                   headers: {
                            'Content-Type': contentType,
                            'Accept': acceptType //'application/json'
                            }
                 };

             if(withDebug) printDebugCurl(method, url, data, contentType);

             $http(request)
             .then(function (response){
                  deferred.resolve(response)
                },function (responseError){
                    var msg = "Failed at method [" + method + "] [" + url + "] with error: \n" + JSON.stringify(responseError);
                    $log.error("HTTP ERROR: ",msg, '\nDATA SENT:', data);
                    if(resolveError && responseError.status === 409) deferred.resolve(responseError); //resolve conflicts to handle
                    else deferred.reject(msg);
                });

             return deferred.promise;
        }
    }

});