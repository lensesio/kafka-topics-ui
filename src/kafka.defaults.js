var KAFKA_DEFAULTS =
  [{
    "property": "cleanup.policy",
    "default": "delete",
    "serverDefaultProperties": "log.cleanup.policy",
    "description": "A string that is either \"delete\" or \"compact\". This string designates the retention policy to use on old log segments. The default policy (\"delete\") will discard old segments when their retention time or size limit has been reached. The \"compact\" setting will enable log compaction on the topic."
  }, {
    "property": "delete.retention.ms",
    "default": "86400000",
    "serverDefaultProperties": "log.cleaner.delete.retention.ms",
    "description": "The amount of time to retain delete tombstone markers for log compacted topics. This setting also gives a bound on the time in which a consumer must complete a read if they begin from offset 0 to ensure that they get a valid snapshot of the final stage (otherwise delete tombstones may be collected before they complete their scan). Default is 24 hours"
  }, {
    "property": "flush.messages",
    "default": "None",
    "serverDefaultProperties": "log.flush.interval.messages",
    "description": "This setting allows specifying an interval at which we will force an fsync of data written to the log. For example if this was set to 1 we would fsync after every message; if it were 5 we would fsync after every five messages. In general we recommend you not set this and use replication for durability and allow the operating system's background flush capabilities as it is more efficient. This setting can be overridden on a per-topic basis (see the per-topic configuration section)."
  }, {
    "property": "flush.ms",
    "default": "None",
    "serverDefaultProperties": "log.flush.interval.ms",
    "description": "This setting allows specifying a time interval at which we will force an fsync of data written to the log. For example if this was set to 1000 we would fsync after 1000 ms had passed. In general we recommend you not set this and use replication for durability and allow the operating system's background flush capabilities as it is more efficient."
  }, {
    "property": "index.interval.bytes",
    "default": "4096",
    "serverDefaultProperties": "log.index.interval.bytes",
    "description": "This setting controls how frequently Kafka adds an index entry to it's offset index. The default setting ensures that we index a message roughly every 4096 bytes. More indexing allows reads to jump closer to the exact position in the log but makes the index larger. You probably don't need to change this."
  }, {
    "property": "max.message.bytes",
    "default": "1000000",
    "serverDefaultProperties": "message.max.bytes",
    "description": "This is largest message size Kafka will allow to be appended to this topic. Note that if you increase this size you must also increase your consumer's fetch size so they can fetch messages this large."
  }, {
    "property": "min.cleanable.dirty.ratio",
    "default": "0.5",
    "serverDefaultProperties": "log.cleaner.min.cleanable.ratio",
    "description": "This configuration controls how frequently the log compactor will attempt to clean the log (assuming log compaction is enabled). By default we will avoid cleaning a log where more than 50% of the log has been compacted. This ratio bounds the maximum space wasted in the log by duplicates (at 50% at most 50% of the log could be duplicates). A higher ratio will mean fewer, more efficient cleanings but will mean more wasted space in the log."
  }, {
    "property": "min.insync.replicas",
    "default": "1",
    "serverDefaultProperties": "min.insync.replicas",
    "description": "When a producer sets acks to \"all\", min.insync.replicas specifies the minimum number of replicas that must acknowledge a write for the write to be considered successful. If this minimum cannot be met, then the producer will raise an exception (either NotEnoughReplicas or NotEnoughReplicasAfterAppend). When used together, min.insync.replicas and acks allow you to enforce greater durability guarantees. A typical scenario would be to create a topic with a replication factor of 3, set min.insync.replicas to 2, and produce with acks of \"all\". This will ensure that the producer raises an exception if a majority of replicas do not receive a write."
  }, {
    "property": "retention.bytes",
    "default": "None",
    "serverDefaultProperties": "log.retention.bytes",
    "description": "This configuration controls the maximum size a log can grow to before we will discard old log segments to free up space if we are using the \"delete\" retention policy. By default there is no size limit only a time limit."
  }, {
    "property": "retention.ms",
    "default": "7 days",
    "serverDefaultProperties": "log.retention.minutes",
    "description": "This configuration controls the maximum time we will retain a log before we will discard old log segments to free up space if we are using the \"delete\" retention policy. This represents an SLA on how soon consumers must read their data."
  }, {
    "property": "segment.bytes",
    "default": "1 GB",
    "serverDefaultProperties": "log.segment.bytes",
    "description": "This configuration controls the segment file size for the log. Retention and cleaning is always done a file at a time so a larger segment size means fewer files but less granular control over retention."
  }, {
    "property": "segment.index.bytes",
    "default": "10 MB",
    "serverDefaultProperties": "log.index.size.max.bytes",
    "description": "This configuration controls the size of the index that maps offsets to file positions. We preallocate this index file and shrink it only after log rolls. You generally should not need to change this setting."
  }, {
    "property": "segment.ms",
    "default": "7 days",
    "serverDefaultProperties": "log.roll.hours",
    "description": "This configuration controls the period of time after which Kafka will force the log to roll even if the segment file isn't full to ensure that retention can delete or compact old data."
  }, {
    "property": "segment.jitter.ms",
    "default": "0",
    "serverDefaultProperties": "log.roll.jitter.{ms,hours}",
    "description": "The maximum jitter to subtract from logRollTimeMillis."
  }];