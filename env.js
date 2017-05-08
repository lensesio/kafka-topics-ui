// Replace with the URL where a Kafka REST service is listening
var clusters = [
    {
      NAME: "prod",
      KAFKA_REST: "/api",
      MAX_BYTES: "50000", 	// Sets the default maximum amount of bytes to fetch from each topic
      RECORD_POLL_TIMEOUT: "500",
      COLOR: "#141414", // Optional
      DEBUG_LOGS_ENABLED: true
    },
    {
      NAME: "dev",
      KAFKA_REST: "localhost",
      MAX_BYTES: "50000",
      COLOR: "red",
      RECORD_POLL_TIMEOUT: "500",
      DEBUG_LOGS_ENABLED: true
    }
  ];