
angularAPP.factory('consumerFactory', function ($rootScope, $http, $log, $q, $filter, $cookies, env) {

  function createConsumers(format, topicName) {
    if(!$cookies.getAll().uuid) {
      var DATE = $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss");
      $cookies.put('uuid', DATE);
      var uuid = $cookies.getAll().uuid
    } else {
      var uuid=$cookies.getAll().uuid
    }

    // Setting a cookie
    var url = env.KAFKA_REST().trim() + '/consumers/kafka_topics_ui_' + format + '_' + uuid;
    var data = '{"name": "kafka-topics-ui-' + format + '", "format": "' + format + '", "auto.offset.reset": "earliest"}';
    var postCreateConsumer = {
      method: 'POST',
      url: url,
      data: data,
      headers: {'Content-Type': 'application/vnd.kafka.v2+json'}
    };

    var curlCreateConsumer = 'curl -X POST -H "Content-Type: ' + 'application/vnd.kafka.v2+json' + '" ' + "--data '" + data + "' " + url;
    $log.debug("  " + curlCreateConsumer);

    var deferred = $q.defer();

    $http(postCreateConsumer).then(
      function success(response) {
        deferred.resolve(response);
      },
        function failure(response) {
      deferred.resolve(response);
    });
    return deferred.promise
  }

  function subscribeAndGetData(consumer, format, topicName) {
    var deferred = $q.defer();

    $http({
      method: 'POST',
      url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/subscription',
      data: '{"topics":["' + topicName + '"]}',
      headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
    }).then(function successCallback(response) {

    console.log("Got Subscription ", response);
    seekToBeginningOrEnd('beginning', consumer, topicName).then(function (responseSeek) {
      //STEP4 : Get Records
      $http({
        method: 'GET',
        url: env.KAFKA_REST().trim() + '/consumers/'+consumer.group+'/instances/'+consumer.instance+'/records?timeout=5000&max_bytes=' + env.MAX_BYTES().trim(),
        headers: {'Content-Type': 'application/vnd.kafka.v2+json', 'Accept': 'application/vnd.kafka.'+format+'.v2+json' }
      }).then(function successCallback(responseRecords) {
          deferred.resolve(responseRecords)
        }, function errorCallback(responseRecords) {
          console.warn('Error in consuming data with',format,  responseRecords)
          deferred.resolve(responseRecords)
        });
    })
    return deferred.promise
    }, function errorCallback(response) {
      console.log('POST not working')
    })
    return deferred.promise
  }

  function seekToBeginningOrEnd (beginningOrEnd, consumer, topicName) {

    var deferred = $q.defer();

    var data =
    {
      "partitions": [
        {
          "topic": topicName,
          "partition": 0
        }
      ]
    }

    var postSeekToBeginningOrEnd = {
      method: 'POST',
      url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/' + beginningOrEnd,
      data: data,
      headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
    }

    $http(postSeekToBeginningOrEnd).then(
      function success(response) {
        deferred.resolve(response);
      },
      function failure(response) {
        deferred.resolve(response);
      });

      return deferred.promise

  }

  function getConsumerOffsets (consumer, topicName) {
    var deferred = $q.defer();

    var data =
    {
      "partitions": [
        {
          "topic": topicName
        }
      ]
    }

    var getConsumerOffsets = {
      method: 'GET',
      url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/offsets/',
      data: data,
      headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
    }

    $http(getConsumerOffsets).then(
      function success(response) {
        deferred.resolve(response);
      },
      function failure(response) {

        deferred.resolve(response);
      });

      return deferred.promise

  }

  function getPartitions (topicName) {
    var deferred = $q.defer();

    var getPartitions = {
      method: 'GET',
      url: env.KAFKA_REST().trim() + '/topics/' + topicName +'/partitions',
      headers: {'Accept': 'application/vnd.kafka.v2+json, application/vnd.kafka+json, application/json' }
    }

    $http(getPartitions).then(
      function success(response) {
        deferred.resolve(response);
      },
      function failure(response) {

        deferred.resolve(response);
      });

      return deferred.promise

  }

  return {
    createConsumers: function (format, topicName) {
          return createConsumers(format, topicName);
        },
    subscribeAndGetData: function (consumer, format, topicName) {
          return subscribeAndGetData(consumer, format, topicName);
        },
    seekToBeginningOrEnd: function (beginningOrEnd, consumer, topicName) {
          return seekToBeginningOrEnd(beginningOrEnd, consumer, topicName);
        },
    getConsumerOffsets: function (consumer, topicName) {
          return getConsumerOffsets(consumer, topicName);
        }

  }
});
