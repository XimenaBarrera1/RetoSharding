rs.initiate({
  _id: "rs_shard2",
  members: [
    { _id: 0, host: "shard2_primary:27017", priority: 2 },
    { _id: 1, host: "shard2_secondary:27017", priority: 1 },
    { _id: 2, host: "shard2_arbiter:27017", arbiterOnly: true }
  ]
})