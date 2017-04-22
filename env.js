// Replace with the URL where a Kafka REST service is listening
var clusters = [
   // {
   //     NAME: "prod",
   //     KAFKA_REST: "http://cloudera03.landoop.com:16781/api/kafka-rest-proxy",
   //     MAX_BYTES: "50000", 	// Sets the default maximum amount of bytes to fetch from each topic
   //     COLOR: "#141414", // Optional
   //     RECORD_POLL_TIMEOUT: "500",
   //     DEBUG_LOGS_ENABLED: true
   // },
//   TODO ENV CHANGE DOESNT WORK
  {
    NAME: "dev",
    KAFKA_REST: "/api",
    MAX_BYTES: "50000",
    COLOR: "red",
    RECORD_POLL_TIMEOUT: "500",
    DEBUG_LOGS_ENABLED: true
  }

];