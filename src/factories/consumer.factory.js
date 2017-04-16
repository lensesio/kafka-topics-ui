
angularAPP.factory('consumerFactory', function ($rootScope, $http, $log, $q, $filter, $cookies, env, HttpFactory, $timeout) {

  var URL_PREFIX = env.KAFKA_REST().trim();
  var CONSUMER_NAME_PREFIX = 'kafka-topics-ui-';
  var RECORDS_TIMEOUT = '500'; //TODO put to env for the user to decide
  var RECORDS_MAX_BYTES = env.MAX_BYTES().trim();
  var CONTENT_TYPE_JSON = 'application/vnd.kafka.v2+json';
  var PRINT_DEBUG_CURLS = false;

  function getConsumer(format, uuid) {
    var consumer = { group :'kafka_topics_ui_'+ format +'_' + uuid,
                     instance: 'kafka-topics-ui-'+ format
                   };
    return consumer;
  }

  function createConsumers(format, topicName, uuid) {
    $log.debug(topicName, "CREATING CONSUMER: ", getConsumer(format, uuid), uuid);
    var url = URL_PREFIX + '/consumers/' + getConsumer(format, uuid).group;
    var data = '{"name": "' + getConsumer(format).instance + '", "format": "' + format + '", "auto.offset.reset": "earliest", "auto.commit.enable": "false"}';
    return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, PRINT_DEBUG_CURLS);
  }

  function subscribeAndGetData(consumer, format, topicName) {
         return $q.all([seekToBeginningOrEnd('beginning', consumer, topicName)])
//                  return seekToBeginningOrEnd('beginning', consumer, topicName)
                  .then(function(res1) {
//                        console.log("RES1", res1)
                      $log.debug(topicName,'4) DONE: SEEK TO BEGGINING FOR ALL PARTITIONS DONE')
                      $log.debug(topicName, "5) START POLLING WITH CONSUMER:", consumer);
                      return getRecords(consumer, format)
                                     .then(function (r) {
                                             if(r.data.length != 0) saveTopicTypeToCookie(topicName, format);
                                             $log.debug(topicName, '6) DONE: GOT RECORDS', r.data.length);
                                             $log.debug(topicName, '7) SAVING TYPE TO COOKIE', format);

                                             HttpFactory.req('DELETE',
                                             URL_PREFIX +'/consumers/'+ consumer.group +'/instances/'+ consumer.instance,
                                             '', CONTENT_TYPE_JSON, '', false, false).then(function(res) {
                                                $log.debug(topicName, "8) CONSUMER DELETED", consumer)
                                             })

                                             return r;
                                           }, function(er){ console.log("ER",er); return -1});
                  });
  }

  function getRecords(consumer, format) {
    var url = URL_PREFIX + '/consumers/'+consumer.group+'/instances/'+consumer.instance+'/records?timeout='+ RECORDS_TIMEOUT +'&max_bytes=' + RECORDS_MAX_BYTES;
    var ACCEPT_HEADER = 'application/vnd.kafka.' + format + '.v2+json';
    return HttpFactory.req('GET', url, '', CONTENT_TYPE_JSON, ACCEPT_HEADER, false, PRINT_DEBUG_CURLS);
  }

  function preparePartitionData(topicName, partitions) {
        var data = {'partitions':[]}
        angular.forEach(partitions, function (partition){
          data.partitions.push({'topic':topicName, 'partition': partition.partition})
        });
        $log.debug(topicName, "PARTITIONS TO ASSIGN", data)
        return data;
  }

// TODO this is the correct one ^ doesnt work
   function seekToBeginningOrEnd(beginningOrEnd, consumer, topicName) {
              return getPartitions(topicName)
                           .then(function(partitions) {
                                $log.debug(topicName,'1) DONE: GOT ALL PARTITIONS', partitions)
                                return postConsumerAssignments(consumer, topicName, partitions.data).then(function(r) {
                                   $log.debug(topicName,'3) DONE: ASSIGNED PARTITIONS TO CONSUMER');
                                   var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/' + beginningOrEnd;
                                   var data = preparePartitionData(topicName, partitions.data);
                                   return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, PRINT_DEBUG_CURLS);
                                })
                           });
    }

  function getPartitions (topicName) {
     var url = env.KAFKA_REST().trim() + '/topics/' + topicName +'/partitions';
     return HttpFactory.req('GET', url, '', '', 'application/vnd.kafka.v2+json, application/vnd.kafka+json, application/json', false, false);
  }

  function postConsumerAssignments (consumer, topicName, partitions) {
//    return deleteConsumerSubscriptions(consumer).then(function(responseDelete){
        var data = preparePartitionData(topicName, partitions)
        $log.debug(topicName, "2) ACTUAL PARTITIONS TO ASSIGN", data)
        var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/assignments';
        return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, PRINT_DEBUG_CURLS);
//    })
  }

  function postConsumerPositions(consumer, topicName, partitions, offset) {

     var data = {'offsets':[]}
     angular.forEach(partitions, function (partition){
        data.offsets.push({'topic':topicName, 'partition': partition, 'offset':offset})
     })

     console.log("ASSIGNING POSITIONS TO OFFSETS", data)

     var url = env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions';
     return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, PRINT_DEBUG_CURLS);
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
//        if(!$cookies.getAll().uuid) {
//           $cookies.put('uuid', $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss")); //TODO milis
//           return $cookies.getAll().uuid
//        } else {
//          return $cookies.getAll().uuid
//        }
       var a = $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss");
//       $log.debug("CONSUMER UUID IS", a);
       $cookies.put('uuid', $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss")); //TODO milis
       return a;
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
          $log.debug(topicName, "DETECTING TYPE.. IT'S A KNOWN [ BINARY ] TOPIC [topics.config.js]")
          return 'binary';
       } if(isKnownJSONTopic(topicName)) {
          $log.debug(topicName, "DETECTING TYPE.. IT'S A KNOWN [ JSON ] TOPIC [topics.config.js]")
          return 'json';
       }  else if (hasCookieType(topicName)) {
          var a = $cookies.getAll();
          $log.debug(topicName, "DETECTING TYPE.. HAVE CONSUMED THIS TOPIC BEFORE, IT'S IN COOKIE. TYPE IS [" + a[topicName] + "]")
          return a[topicName];
       } else {
          $log.debug(topicName, "DETECTING TYPE.. DON'T KNOW THE TYPE I WILL TRY WITH [ AVRO ] FIRST")
          return 'avro';
       }
    }

    function getConsumerTypeRetry(previousFormatTried, topicName){
        switch(previousFormatTried) {
            case 'avro':
                $log.debug(topicName, "DETECTING TYPE.. FAILED WITH AVRO, WILL TRY [ JSON ]")
                return 'json';
                break;
            case 'json':
                $log.debug(topicName, "DETECTING TYPE.. FAILED WITH JSON, WILL TRY [ BINARY ]")
                return 'binary';
                break;
            default:
                $log.debug(topicName, "DETECTING TYPE.. FAILED WITH AVRO & JSON, WILL TRY [ BINARY ]")
                return 'binary';
        }
    }

    //PUBLIC METHODS

  return {
    createConsumers: function (format, topicName, uuid) {
          return createConsumers(format, topicName, uuid); //TODO why plural?
        },
    getConsumer: function (format, uuid) {
          return getConsumer(format, uuid);
    },
    getConsumerType: function (topicName) {
          return getConsumerType(topicName);
    },
    getConsumerTypeRetry: function (previousFormatTried, topicName) {
          return getConsumerTypeRetry(previousFormatTried, topicName);
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
        },
    genUUID: function () {
          return consumerUUID();
        }
  }
});
