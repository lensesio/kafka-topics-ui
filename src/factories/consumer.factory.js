
angularAPP.factory('consumerFactory', function ($rootScope, $http, $log, $q, $filter, $cookies, env, HttpFactory) {

  var URL_PREFIX = env.KAFKA_REST().trim();
  var CONSUMER_NAME_PREFIX = 'kafka-topics-ui-';
  var RECORDS_TIMEOUT = '500'; //TODO put to env for the user to decide
  var RECORDS_MAX_BYTES = env.MAX_BYTES().trim();
  var CONTENT_TYPE_JSON = 'application/vnd.kafka.v2+json';

  function getConsumer(format) {
    var consumer = { group :'kafka_topics_ui_'+ format +'_' + consumerUUID(),
                     instance: 'kafka-topics-ui-'+ format
                   };
    return consumer;
  }

  function createConsumers(format, topicName, withDebug) {
    //why instance and group names different?
    var url = URL_PREFIX + '/consumers/' + getConsumer(format).group;
    var data = '{"name": "' + getConsumer(format).instance + '", "format": "' + format + '", "auto.offset.reset": "earliest", "auto.commit.enable": "false"}';//TODO shall we parameterise?

    return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, false); //return existing ?
  }

  /**
   * Subscribe Instance to topic
   * Then seek to beginning
   * Then get records
   * Then return records if ok, or -1 in case of error in order to retry with different format
   **/
  function subscribeAndGetData(consumer, format, topicName) {

    $log.debug("Trying with consumer:", consumer);

    var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/subscription'
    var data = '{"topics":["' + topicName + '"]}';

    return $q.all([HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, true),
                   seekToBeginningOrEnd('beginning', consumer, topicName, -1)])
             .then(function(res1, res2) {
                 return getRecords(consumer, format)
                                .then(function (r) {
                                        if(r.data.length != 0) saveTopicTypeToCookie(topicName, format);
                                        return r;
                                      }, function(er){ console.log("ER",er); return -1});
             });
//    return $q.all([HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, true)])
//             .then(function(res1) {
//                 return getRecords(consumer, format)
//                                .then(function (r) {
//                                        if(r.data.length != 0) saveTopicTypeToCookie(topicName, format);
//                                        return r;
//                                      }, function(er){ console.log("ER",er); return -1});
//             });
  }

  function getRecords(consumer, format) {
    var url = URL_PREFIX + '/consumers/'+consumer.group+'/instances/'+consumer.instance+'/records?timeout='+ RECORDS_TIMEOUT +'&max_bytes=' + RECORDS_MAX_BYTES;
    var ACCEPT_HEADER = 'application/vnd.kafka.' + format + '.v2+json';
    return HttpFactory.req('GET', url, '', CONTENT_TYPE_JSON, ACCEPT_HEADER, false, false);
  }

  function preparePartitionData(topicName, partitions) {
        var data = {'partitions':[]}

//        if(partitions.length == 1) {
//            console.log("1 partition")
//            data.partitions.push({'topic':topicName, 'partition': partitions})
//        }

        angular.forEach(partitions, function (partition){
          data.partitions.push({'topic':topicName, 'partition': partition.partition})
        });

        console.log("FINAL PARTITIONS", JSON.stringify(data))
        return data;
  }

  function seekToBeginningOrEnd (beginningOrEnd, consumer, topicName) {
    return $q.all([getPartitions(topicName)])
             .then(function(partitions) {
                     var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/' + beginningOrEnd;
                     var data = preparePartitionData(topicName, partitions.data);
                     return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, false);
             });
  }

// TODO this is the correct one ^ doesnt work
//   function seekToBeginningOrEnd (beginningOrEnd, consumer, topicName, partition) {
//          console.log("PARTTTT", partition)
//              return getPartitions(topicName)
//                           .then(function(partitions) {
//                                   var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/' + beginningOrEnd;
//                                   var data = preparePartitionData(topicName, partitions.data);
//                                   return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, false);
//                           });
//  //        }
//    }

  function getPartitions (topicName) {
     var url = env.KAFKA_REST().trim() + '/topics/' + topicName +'/partitions';
     return HttpFactory.req('GET', url, '', '', 'application/vnd.kafka.v2+json, application/vnd.kafka+json, application/json', false, false);
  }

//TODO
//  function getConsumerOffsets (consumer, topicName) {
//    var deferred = $q.defer();
//
//    var data =
//    {
//      "partitions": [
//        {
//          "topic": topicName
//        }
//      ]
//    }
//
//    var getConsumerOffsets = {
//      method: 'GET',
//      url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/offsets/',
//      data: data,
//      headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
//    }
//
//    $http(getConsumerOffsets).then(
//      function success(response) {
//        deferred.resolve(response);
//      },
//      function failure(response) {
//
//        deferred.resolve(response);
//      });
//
//      return deferred.promise
//
//  }


   //TODO but this works fine
  function postConsumerAssignments (consumer, topicName, partitions) {
    console.log("WILL ASSIGN",partitions);
    var deferred = $q.defer();
    deleteConsumerSubscriptions(consumer).then(function(responseDelete){

      var data = {'partitions':[]}
      angular.forEach(partitions, function (partition){
        data.partitions.push({'topic':topicName, 'partition': partition})
      })

      var getConsumerOffsets = {
        method: 'POST',
        url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/assignments',
        data: data,
        headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
      }

      $http(getConsumerOffsets).then(
        function success(response) {
//          console.log("ASSIGNMENTS ",response)
//          $http(getAssignments).then(function(res) { console.log("ASSSS", res)})
          deferred.resolve(response);
        },
        function failure(response) {
          deferred.resolve(response);
       });
    })

  return deferred.promise

  }

  function postConsumerPositions(consumer, topicName, partitions, offset) {
    var deferred = $q.defer();

     var data = {'offsets':[]}
      angular.forEach(partitions, function (partition){
        data.offsets.push({'topic':topicName, 'partition': partition, 'offset':offset})
      })

      console.log("DDDDDD", data)

      var postConsumerOffsets = {
        method: 'POST',
        url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions',
        data: data,
        headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
      }

      $http(postConsumerOffsets).then(
        function success(response) {
          deferred.resolve(response);

        },
        function failure(response) {
          deferred.resolve(response);
       });

  return deferred.promise

  }

  function deleteConsumerSubscriptions (consumer) {
    var deferred = $q.defer();

    var getConsumerOffsets = {
      method: 'DELETE',
      url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/subscription',
      headers: {'Accept': 'application/vnd.kafka.v2+json, application/vnd.kafka+json, application/json' }
    }

    $http(getConsumerOffsets).then(
      function success(response) {
        deferred.resolve(response);
      },
      function failure(response) {

        deferred.reject(response);
      });

      return deferred.promise

  }

  //UTILITIES
   function consumerUUID() {
        if(!$cookies.getAll().uuid) {
           $cookies.put('uuid', $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss")); //TODO milis
           return $cookies.getAll().uuid
        } else {
          return $cookies.getAll().uuid
        }
    }

    function saveTopicTypeToCookie(topicName, format){
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 1);
      $cookies.put(topicName, format, {'expires': expireDate});
    }

    function hasCookieType(topicName) {
       var a = $cookies.getAll();
       return a[topicName] ? true : false;
    }

    function isKnownBinaryTopic(topicName) {
         var a = false;
         angular.forEach(KNOWN_TOPICS.JSON_TOPICS, function(t){  //todo filter
              if(t == topicName) a = true;
         })
         return a;
    }

    function isKnownJSONTopic(topicName) {
         var a = false;
             angular.forEach(KNOWN_TOPICS.BINARY_TOPICS, function(t){  //todo filter
                  if(t == topicName) a = true;
             })
             return a;
    }

    function getConsumerType(topicName) {
       if(isKnownBinaryTopic(topicName)) {
          return 'binary';
       } if(isKnownJSONTopic(topicName)) {
          return 'json';
       }  else if (hasCookieType(topicName)) {
          var a = $cookies.getAll();
          return a[topicName];
       } else {
          console.log("I dont know the type");
          return 'avro'; //if type is unknown try with 'avro'
       }
    }

    //PUBLIC METHODS

  return {
    createConsumers: function (format, topicName) {
          return createConsumers(format, topicName); //TODO why plural?
        },
    getConsumer: function (format) {
          return getConsumer(format);
    },
    getConsumerType: function (topicName) {
          return getConsumerType(topicName);
    },
    subscribeAndGetData: function (consumer, format, topicName) {
          return subscribeAndGetData(consumer, format, topicName);
        },
    seekToBeginningOrEnd: function (beginningOrEnd, consumer, topicName, partition) {
          return seekToBeginningOrEnd(beginningOrEnd, consumer, topicName, partition);
        },
    postConsumerPositions: function (consumer, topicName, partition, offset) {
          return postConsumerPositions(consumer, topicName, partition, offset);
        },
    postConsumerAssignments: function (consumer, topicName, partitions) {
          return postConsumerAssignments(consumer, topicName, partitions);
        },
    getRecords: function (consumer, format) {
          return getRecords(consumer, format);
        },
    deleteConsumerSubscriptions: function (consumer) {
          return deleteConsumerSubscriptions(consumer);
        },
    getConsumerOffsets: function (consumer, topicName) {
          return getConsumerOffsets(consumer, topicName);
        },
    getPartitions: function (topicName) {
          return getPartitions(topicName);
        }
  }
});
